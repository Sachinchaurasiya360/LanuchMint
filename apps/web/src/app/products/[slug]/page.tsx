import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, MessageSquare, ShieldCheck, Star } from "lucide-react";
import { db } from "@launchmint/db";
import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from "@launchmint/ui";
import {
  breadcrumbJsonLd,
  buildMetadata,
  renderJsonLd,
  reviewJsonLd,
  softwareApplicationJsonLd,
} from "@launchmint/seo-meta";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UpvoteButton } from "./upvote-button";
import { CommentThread, type ThreadComment } from "./comment-thread";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { slug: string };

async function getProduct(slug: string) {
  return db.product.findFirst({
    where: { slug, status: "LIVE", deletedAt: null },
    include: {
      workspace: {
        include: { founderProfile: { select: { displayName: true, slug: true } } },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Not found" };
  return buildMetadata({
    title: product.metaTitle ?? `${product.name} — ${product.tagline}`,
    description: product.metaDescription ?? product.tagline,
    path: `/products/${product.slug}`,
    image: product.ogImageUrl ?? product.logoUrl ?? undefined,
  });
}

export default async function PublicProductPage({ params }: { params: Params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const session = await auth();
  const viewerId = session?.user?.id ?? null;

  const [upvoteCount, viewerUpvote, commentRows, reviewRows] = await Promise.all([
    db.upvote.count({ where: { productId: product.id } }),
    viewerId
      ? db.upvote.findUnique({
          where: { productId_userId: { productId: product.id, userId: viewerId } },
          select: { id: true },
        })
      : Promise.resolve(null),
    db.comment.findMany({
      where: { productId: product.id, status: "PUBLISHED", deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
    db.review.findMany({
      where: {
        productId: product.id,
        status: "PUBLISHED",
        deletedAt: null,
      },
      orderBy: [{ publishedAt: "desc" }],
      include: {
        author: { select: { name: true, avatarUrl: true } },
        reply: true,
      },
    }),
  ]);

  const founder = product.workspace.founderProfile;
  const path = `/products/${product.slug}`;

  const ratingCount = reviewRows.length;
  const ratingValue =
    ratingCount === 0
      ? 0
      : Number(
          (reviewRows.reduce((s, r) => s + r.rating, 0) / ratingCount).toFixed(2),
        );

  const jsonLd = [
    softwareApplicationJsonLd({
      slug: product.slug,
      name: product.name,
      description: product.description,
      image: product.ogImageUrl ?? product.logoUrl ?? undefined,
      category: product.category,
      url: path,
      rating:
        ratingCount > 0 ? { value: ratingValue, count: ratingCount } : undefined,
      founder: founder
        ? { name: founder.displayName, url: `/founders/${founder.slug}` }
        : undefined,
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: product.name, url: path },
    ]),
    ...reviewRows.slice(0, 20).map((r) =>
      reviewJsonLd({
        id: r.id,
        productSlug: product.slug,
        productName: product.name,
        authorName: r.author?.name ?? "Verified Customer",
        rating: r.rating,
        title: r.title ?? undefined,
        body: r.body,
        publishedAt: (r.publishedAt ?? r.createdAt).toISOString(),
      }),
    ),
  ];

  const threaded = buildThread(commentRows);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(jsonLd) }}
        />
        <div className="flex items-start gap-4">
          {product.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.logoUrl}
              alt={`${product.name} logo`}
              width={64}
              height={64}
              className="rounded-lg border"
            />
          ) : null}
          <div className="flex-1">
            <Badge variant="secondary">{product.category}</Badge>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              {product.tagline}
            </p>
            {ratingCount > 0 ? (
              <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center text-amber-600">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5"
                      fill={i < Math.round(ratingValue) ? "currentColor" : "none"}
                    />
                  ))}
                </span>
                <span>
                  {ratingValue} · {ratingCount} review{ratingCount === 1 ? "" : "s"}
                </span>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-2">
            <UpvoteButton
              productId={product.id}
              initialCount={upvoteCount}
              initialUpvoted={Boolean(viewerUpvote)}
              signedIn={Boolean(viewerId)}
            />
            <Button asChild size="sm">
              <a
                href={product.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <section className="mt-10 prose prose-sm max-w-none">
          <h2 className="text-lg font-semibold">About</h2>
          <p className="whitespace-pre-line text-sm leading-7 text-foreground">
            {product.description}
          </p>
        </section>

        {founder ? (
          <section className="mt-10 rounded-lg border p-4">
            <h2 className="text-sm font-medium text-muted-foreground">Founder</h2>
            <Link
              href={`/founders/${founder.slug}`}
              className="mt-1 inline-block text-base font-semibold hover:underline"
            >
              {founder.displayName}
            </Link>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Reviews</h2>
          {reviewRows.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No reviews yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {reviewRows.map((r) => {
                const name = r.author?.name ?? "Verified Customer";
                const initial = name[0]?.toUpperCase() ?? "?";
                return (
                  <li key={r.id} className="rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        {r.author?.avatarUrl ? (
                          <AvatarImage src={r.author.avatarUrl} alt={name} />
                        ) : null}
                        <AvatarFallback>{initial}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{name}</span>
                          <span className="inline-flex items-center text-amber-600">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-3 w-3"
                                fill={i < r.rating ? "currentColor" : "none"}
                              />
                            ))}
                          </span>
                          {r.isVerified ? (
                            <Badge variant="secondary" className="gap-1">
                              <ShieldCheck className="h-3 w-3" /> Verified Customer
                            </Badge>
                          ) : null}
                        </div>
                        {r.title ? (
                          <p className="mt-1 text-sm font-semibold">{r.title}</p>
                        ) : null}
                        <p className="mt-1 whitespace-pre-line text-sm leading-6">
                          {r.body}
                        </p>
                      </div>
                    </div>
                    {r.reply ? (
                      <div className="mt-4 ml-12 rounded-md bg-secondary/40 p-3">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Founder reply
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-6">
                          {r.reply.body}
                        </p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquare className="h-4 w-4" /> Discussion ({commentRows.length})
          </h2>
          <div className="mt-4">
            <CommentThread
              productId={product.id}
              comments={threaded}
              signedIn={Boolean(viewerId)}
              viewerId={viewerId}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

interface CommentRow {
  id: string;
  body: string;
  createdAt: Date;
  parentId: string | null;
  author: { id: string; name: string | null; avatarUrl: string | null };
}

function buildThread(rows: CommentRow[]): ThreadComment[] {
  const byId = new Map<string, ThreadComment>();
  const roots: ThreadComment[] = [];
  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      author: r.author,
      replies: [],
    });
  }
  for (const r of rows) {
    const node = byId.get(r.id)!;
    if (r.parentId && byId.has(r.parentId)) {
      byId.get(r.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
