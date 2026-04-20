import Link from "next/link";
import { db } from "@launchmint/db";
import { Badge, EmptyState } from "@launchmint/ui";
import { ShieldAlert } from "lucide-react";
import {
  decideCommentAction,
  decideProductAction,
  decideReviewAction,
} from "./actions";
import { ModerationRowActions } from "./row-actions";

export const dynamic = "force-dynamic";

type SearchParams = { tab?: "reviews" | "comments" | "products" };

const TABS: { id: Required<SearchParams>["tab"]; label: string }[] = [
  { id: "reviews", label: "Reviews" },
  { id: "comments", label: "Comments" },
  { id: "products", label: "Products" },
];

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const tab = searchParams.tab ?? "reviews";

  const [reviewCount, commentCount, productCount] = await Promise.all([
    db.review.count({ where: { status: "FLAGGED", deletedAt: null } }),
    db.comment.count({ where: { status: "FLAGGED", deletedAt: null } }),
    countFlaggedProducts(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Moderation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review flagged items and publish or remove them. Every action is
            recorded in the audit log.
          </p>
        </div>
      </header>

      <nav className="mt-6 flex gap-2 border-b">
        {TABS.map((t) => {
          const count =
            t.id === "reviews"
              ? reviewCount
              : t.id === "comments"
                ? commentCount
                : productCount;
          const active = t.id === tab;
          return (
            <Link
              key={t.id}
              href={`/app/admin/moderation?tab=${t.id}`}
              className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm ${
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              <Badge variant="secondary">{count}</Badge>
            </Link>
          );
        })}
      </nav>

      <section className="mt-6">
        {tab === "reviews" ? <ReviewQueue /> : null}
        {tab === "comments" ? <CommentQueue /> : null}
        {tab === "products" ? <ProductQueue /> : null}
      </section>
    </div>
  );
}

async function ReviewQueue() {
  const rows = await db.review.findMany({
    where: { status: "FLAGGED", deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      product: { select: { slug: true, name: true } },
      author: { select: { name: true, email: true } },
    },
  });
  if (rows.length === 0)
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Queue empty"
        description="No flagged reviews right now."
      />
    );
  return (
    <ul className="divide-y rounded-lg border">
      {rows.map((r) => (
        <li key={r.id} className="flex items-start gap-4 p-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Link
                href={`/products/${r.product.slug}`}
                className="font-medium text-foreground hover:underline"
              >
                {r.product.name}
              </Link>
              <span>·</span>
              <span>{r.author?.name ?? r.author?.email ?? "anonymous"}</span>
              {typeof r.fakeScore === "number" ? (
                <Badge variant="secondary">
                  fake score {r.fakeScore.toFixed(2)}
                </Badge>
              ) : null}
              <span>rating {r.rating}/5</span>
            </div>
            {r.title ? (
              <p className="mt-1 text-sm font-semibold">{r.title}</p>
            ) : null}
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {r.body}
            </p>
          </div>
          <ModerationRowActions
            id={r.id}
            kind="review"
            decide={decideReviewAction}
          />
        </li>
      ))}
    </ul>
  );
}

async function CommentQueue() {
  const rows = await db.comment.findMany({
    where: { status: "FLAGGED", deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      product: { select: { slug: true, name: true } },
      author: { select: { name: true, email: true } },
    },
  });
  if (rows.length === 0)
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Queue empty"
        description="No flagged comments right now."
      />
    );
  return (
    <ul className="divide-y rounded-lg border">
      {rows.map((c) => (
        <li key={c.id} className="flex items-start gap-4 p-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Link
                href={`/products/${c.product.slug}`}
                className="font-medium text-foreground hover:underline"
              >
                {c.product.name}
              </Link>
              <span>·</span>
              <span>{c.author?.name ?? c.author?.email ?? "anonymous"}</span>
            </div>
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {c.body}
            </p>
          </div>
          <ModerationRowActions
            id={c.id}
            kind="comment"
            decide={decideCommentAction}
          />
        </li>
      ))}
    </ul>
  );
}

async function countFlaggedProducts(): Promise<number> {
  const [reviewProds, commentProds] = await Promise.all([
    db.review.findMany({
      where: { status: "FLAGGED", deletedAt: null },
      select: { productId: true },
      distinct: ["productId"],
    }),
    db.comment.findMany({
      where: { status: "FLAGGED", deletedAt: null },
      select: { productId: true },
      distinct: ["productId"],
    }),
  ]);
  const ids = new Set<string>();
  for (const r of reviewProds) ids.add(r.productId);
  for (const c of commentProds) ids.add(c.productId);
  return ids.size;
}

async function ProductQueue() {
  const [reviewProds, commentProds] = await Promise.all([
    db.review.groupBy({
      by: ["productId"],
      where: { status: "FLAGGED", deletedAt: null },
      _count: { _all: true },
    }),
    db.comment.groupBy({
      by: ["productId"],
      where: { status: "FLAGGED", deletedAt: null },
      _count: { _all: true },
    }),
  ]);
  const counts = new Map<string, { reviews: number; comments: number }>();
  for (const r of reviewProds)
    counts.set(r.productId, {
      reviews: r._count._all,
      comments: 0,
    });
  for (const c of commentProds) {
    const existing = counts.get(c.productId) ?? { reviews: 0, comments: 0 };
    existing.comments = c._count._all;
    counts.set(c.productId, existing);
  }
  const ids = Array.from(counts.keys());
  if (ids.length === 0)
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Queue empty"
        description="No products with flagged content."
      />
    );

  const rows = await db.product.findMany({
    where: { id: { in: ids }, deletedAt: null },
    include: { workspace: { select: { name: true } } },
  });
  return (
    <ul className="divide-y rounded-lg border">
      {rows.map((p) => {
        const c = counts.get(p.id) ?? { reviews: 0, comments: 0 };
        return (
          <li key={p.id} className="flex items-start gap-4 p-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Link
                  href={`/products/${p.slug}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {p.name}
                </Link>
                <span>·</span>
                <span>{p.workspace.name}</span>
                <Badge variant="secondary">{p.category}</Badge>
                <Badge variant="secondary">status {p.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {c.reviews} flagged review{c.reviews === 1 ? "" : "s"} ·{" "}
                {c.comments} flagged comment{c.comments === 1 ? "" : "s"}
              </p>
            </div>
            <ModerationRowActions
              id={p.id}
              kind="product"
              decide={decideProductAction}
            />
          </li>
        );
      })}
    </ul>
  );
}
