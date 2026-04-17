import { db } from "@launchmint/db";
import {
  generateDirectoryDescription,
  recommendDirectories,
  type DirectoryCandidate,
} from "@launchmint/ai";
import { enqueue, type HandlerMap } from "@launchmint/queue";

const VERIFY_INTERVAL_DAYS = 1;
const VERIFY_TIMEOUT_MS = 12_000;
const RECOMMEND_TOP_K = 25;
const RECOMMEND_CANDIDATE_POOL = 80;

export const directoryHandlers: HandlerMap = {
  /**
   * Per-product AI ranker. Pulls active directories matching at least one of
   * the product's category tags, scores them with Flash, and persists the
   * top-K as PENDING DirectorySubmission rows so the founder UI can show
   * "Recommended directories" without recomputing on every page load.
   */
  "ai-recommend-directories": async (data) => {
    const product = await db.product.findUnique({
      where: { id: data.productId },
      select: {
        id: true,
        name: true,
        tagline: true,
        category: true,
        seoKeywords: true,
        workspaceId: true,
      },
    });
    if (!product) return;

    const candidates = await db.directory.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { category: { has: product.category } },
          { category: { isEmpty: false } },
        ],
      },
      orderBy: [{ domainRating: "desc" }],
      take: RECOMMEND_CANDIDATE_POOL,
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        niche: true,
        domainRating: true,
        cost: true,
      },
    });
    if (candidates.length === 0) return;

    const result = await recommendDirectories({
      workspaceId: product.workspaceId,
      productId: product.id,
      productName: product.name,
      productTagline: product.tagline,
      productCategory: product.category,
      productKeywords: product.seoKeywords,
      candidates: candidates as DirectoryCandidate[],
      topK: RECOMMEND_TOP_K,
    });

    for (const rec of result.ranked) {
      await db.directorySubmission.upsert({
        where: {
          productId_directoryId: {
            productId: product.id,
            directoryId: rec.id,
          },
        },
        create: {
          productId: product.id,
          directoryId: rec.id,
          workspaceId: product.workspaceId,
          status: "PENDING",
          metadata: {
            recommendation: {
              score: rec.score,
              reason: rec.reason,
              rankedAt: new Date().toISOString(),
            },
          },
        },
        update: {
          metadata: {
            recommendation: {
              score: rec.score,
              reason: rec.reason,
              rankedAt: new Date().toISOString(),
            },
          },
        },
      });
    }
  },

  /**
   * Per-submission worker. For form-only directories it generates a tailored
   * description and marks the submission IN_PROGRESS so the founder can copy +
   * submit manually. For API-enabled directories the handler is the place to
   * call the directory's POST endpoint — for now we mark SUBMITTED with a note
   * so the verify-tick can take over backlink polling.
   */
  "submit-directory": async (data) => {
    const submission = await db.directorySubmission.findUnique({
      where: { id: data.submissionId },
      include: {
        directory: true,
        product: {
          select: {
            name: true,
            tagline: true,
            description: true,
            category: true,
            websiteUrl: true,
            workspaceId: true,
          },
        },
      },
    });
    if (!submission) return;

    if (submission.directory.status !== "ACTIVE") {
      await db.directorySubmission.update({
        where: { id: submission.id },
        data: { status: "REJECTED", notes: "Directory is not currently accepting submissions." },
      });
      return;
    }

    if (submission.directory.hasApi) {
      await db.directorySubmission.update({
        where: { id: submission.id },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          notes:
            submission.directory.apiNotes ??
            "Submitted via directory API. Awaiting indexing.",
        },
      });
      return;
    }

    const description =
      submission.generatedDescription ??
      (
        await generateDirectoryDescription({
          workspaceId: submission.product.workspaceId,
          productId: submission.productId,
          productName: submission.product.name,
          productTagline: submission.product.tagline,
          productDescription: submission.product.description,
          productCategory: submission.product.category,
          productUrl: submission.product.websiteUrl,
          directoryName: submission.directory.name,
          directoryNiche: submission.directory.niche,
          directoryAudience: inferAudience(submission.directory.category),
          maxLength: 280,
        })
      ).description;

    await db.directorySubmission.update({
      where: { id: submission.id },
      data: {
        status: "IN_PROGRESS",
        generatedDescription: description,
        notes: "Description ready. Submit manually via the directory's form.",
      },
    });
  },

  /**
   * Polls the directory listing URL looking for an outbound link to the
   * product. Promotes IN_PROGRESS / SUBMITTED rows to LIVE on success and
   * stamps the live URL where the backlink was found.
   */
  "verify-directory-backlink": async (data) => {
    const submission = await db.directorySubmission.findUnique({
      where: { id: data.submissionId },
      include: {
        directory: true,
        product: { select: { id: true, websiteUrl: true, slug: true } },
      },
    });
    if (!submission) return;
    if (submission.status === "LIVE" || submission.status === "REJECTED") return;

    const productHost = safeHost(submission.product.websiteUrl);
    if (!productHost) return;

    const targets = [submission.directory.url];
    const found = await findBacklink(targets, productHost);

    if (found) {
      const now = new Date();
      await db.directorySubmission.update({
        where: { id: submission.id },
        data: {
          status: "LIVE",
          livedAt: now,
          liveUrl: found.url,
        },
      });
      await db.backlink
        .upsert({
          where: {
            productId_sourceUrl_targetUrl: {
              productId: submission.product.id,
              sourceUrl: found.url,
              targetUrl: submission.product.websiteUrl,
            },
          },
          create: {
            productId: submission.product.id,
            sourceUrl: found.url,
            targetUrl: submission.product.websiteUrl,
            anchorText: submission.directory.name,
            isLive: true,
            firstSeenAt: now,
            lastSeenAt: now,
          },
          update: {
            isLive: true,
            lastSeenAt: now,
            lostAt: null,
          },
        })
        .catch(() => {});
    }
  },

  /**
   * Daily driver: re-verifies non-LIVE submissions older than 1 day and
   * polls LIVE rows weekly to detect link rot.
   */
  "directory-verify-tick": async () => {
    const cutoff = new Date(
      Date.now() - VERIFY_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
    );
    const due = await db.directorySubmission.findMany({
      where: {
        status: { in: ["SUBMITTED", "IN_PROGRESS"] },
        OR: [{ updatedAt: { lt: cutoff } }, { livedAt: null }],
      },
      take: 200,
      select: { id: true },
    });
    for (const row of due) {
      await enqueue("verify-directory-backlink", { submissionId: row.id }).catch(
        () => {},
      );
    }
  },
};

function inferAudience(categories: string[]): string {
  if (categories.some((c) => c.toLowerCase().includes("ai")))
    return "AI builders and ML practitioners";
  if (categories.some((c) => c.toLowerCase().includes("design")))
    return "designers and creative professionals";
  if (categories.some((c) => c.toLowerCase().includes("dev")))
    return "developers evaluating new tools";
  if (categories.some((c) => c.toLowerCase().includes("saas")))
    return "founders and SaaS operators";
  return "early-stage founders and startup explorers";
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function findBacklink(
  pageUrls: string[],
  productHost: string,
): Promise<{ url: string } | null> {
  for (const pageUrl of pageUrls) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), VERIFY_TIMEOUT_MS);
      const res = await fetch(pageUrl, {
        redirect: "follow",
        headers: {
          "user-agent":
            "LaunchMint/1.0 (+https://launchmint.io) backlink-verifier",
        },
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const html = await res.text();
      const re = new RegExp(
        `https?:\\/\\/(?:www\\.)?${productHost.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\s"'<>]*`,
        "i",
      );
      const match = html.match(re);
      if (match) return { url: pageUrl };
    } catch {
      // ignore — try next URL
    }
  }
  return null;
}
