import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@launchmint/db";
import { Badge } from "@launchmint/ui";
import { requireSession } from "@/lib/session";
import { RecommendButton } from "./recommend-button";
import { SubmissionRow } from "./submission-row";

export const dynamic = "force-dynamic";

interface Params {
  id: string;
}

export default async function ProductDirectoriesPage({
  params,
}: {
  params: Params;
}) {
  const { workspaceId } = await requireSession();

  const product = await db.product.findFirst({
    where: { id: params.id, workspaceId, deletedAt: null },
    select: { id: true, name: true, slug: true, websiteUrl: true },
  });
  if (!product) notFound();

  const submissions = await db.directorySubmission.findMany({
    where: { productId: product.id, workspaceId },
    orderBy: { updatedAt: "desc" },
    include: { directory: true },
  });

  const grouped = {
    recommended: submissions.filter((s) => s.status === "PENDING"),
    inProgress: submissions.filter((s) => s.status === "IN_PROGRESS"),
    submitted: submissions.filter((s) => s.status === "SUBMITTED"),
    live: submissions.filter((s) => s.status === "LIVE"),
    rejected: submissions.filter(
      (s) => s.status === "REJECTED" || s.status === "EXPIRED",
    ),
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href={`/app/products/${product.id}/edit`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to product
      </Link>
      <header className="mt-3 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Directory submissions - {product.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI ranks the best directories for this product, then drafts
            tailored copy. We poll for backlinks once a day.
          </p>
        </div>
        <RecommendButton productId={product.id} />
      </header>

      <Section
        productId={product.id}
        title={`Recommended (${grouped.recommended.length})`}
        description="AI-ranked candidates. Start a submission to generate tailored copy."
        empty="No recommendations yet. Click 'Refresh recommendations' to score directories."
        items={grouped.recommended}
        showRecommendation
      />
      <Section
        productId={product.id}
        title={`Description ready (${grouped.inProgress.length})`}
        description="Copy-paste the draft into the directory's submit form."
        empty="Nothing in progress."
        items={grouped.inProgress}
      />
      <Section
        productId={product.id}
        title={`Awaiting backlink (${grouped.submitted.length})`}
        description="Submitted - we'll poll for the live listing daily."
        empty="No pending verifications."
        items={grouped.submitted}
      />
      <Section
        productId={product.id}
        title={`Live (${grouped.live.length})`}
        description="Backlink confirmed. Logged to the SEO dashboard."
        empty="No live listings yet."
        items={grouped.live}
        compact
      />
      {grouped.rejected.length > 0 ? (
        <Section
          productId={product.id}
          title={`Dismissed (${grouped.rejected.length})`}
          description="Skipped or rejected directories."
          empty=""
          items={grouped.rejected}
          compact
        />
      ) : null}

      <p className="mt-10 text-xs text-muted-foreground">
        Browse the full database:{" "}
        <Link href="/directories" className="underline">
          /directories
        </Link>
      </p>
    </div>
  );
}

interface SectionProps {
  productId: string;
  title: string;
  description: string;
  empty: string;
  items: Array<{
    id: string;
    productId: string;
    status: string;
    generatedDescription: string | null;
    notes: string | null;
    liveUrl: string | null;
    submittedAt: Date | null;
    livedAt: Date | null;
    metadata: unknown;
    directory: {
      id: string;
      slug: string;
      name: string;
      url: string;
      submitUrl: string | null;
      hasApi: boolean;
      cost: string;
      domainRating: number | null;
    };
  }>;
  showRecommendation?: boolean;
  compact?: boolean;
}

function Section(props: SectionProps) {
  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium text-muted-foreground">
        {props.title}
      </h2>
      {props.description ? (
        <p className="mt-1 text-xs text-muted-foreground">{props.description}</p>
      ) : null}
      {props.items.length === 0 ? (
        props.empty ? (
          <p className="mt-3 text-sm text-muted-foreground">{props.empty}</p>
        ) : null
      ) : (
        <ul className="mt-3 space-y-3">
          {props.items.map((s) => {
            const meta = (s.metadata as Record<string, unknown> | null) ?? {};
            const reco = (meta as { recommendation?: { score?: number; reason?: string } })
              .recommendation;
            return (
              <li key={s.id}>
                {props.compact ? (
                  <CompactRow s={s} />
                ) : (
                  <SubmissionRow
                    productId={props.productId}
                    submission={{
                      id: s.id,
                      status: s.status,
                      generatedDescription: s.generatedDescription,
                      notes: s.notes,
                      liveUrl: s.liveUrl,
                      directory: s.directory,
                      recommendation: props.showRecommendation
                        ? {
                            score: reco?.score ?? null,
                            reason: reco?.reason ?? null,
                          }
                        : null,
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function CompactRow({
  s,
}: {
  s: {
    status: string;
    liveUrl: string | null;
    directory: { name: string; slug: string; url: string };
  };
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
      <div className="min-w-0 flex-1">
        <Link
          href={`/directories/${s.directory.slug}`}
          className="font-medium hover:underline"
        >
          {s.directory.name}
        </Link>
        {s.liveUrl ? (
          <a
            href={s.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View listing <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
      <Badge variant="outline">{s.status}</Badge>
    </div>
  );
}
