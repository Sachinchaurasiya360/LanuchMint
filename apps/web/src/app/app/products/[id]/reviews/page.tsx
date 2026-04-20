import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, ShieldCheck, Flag } from "lucide-react";
import { db } from "@launchmint/db";
import { Badge } from "@launchmint/ui";
import { requireSession } from "@/lib/session";
import { InviteReviewersForm } from "./invite-form";
import { ReviewRow } from "./review-row";

export const dynamic = "force-dynamic";

interface Params {
  id: string;
}

export default async function ProductReviewsPage({ params }: { params: Params }) {
  const { workspaceId } = await requireSession();

  const product = await db.product.findFirst({
    where: { id: params.id, workspaceId, deletedAt: null },
    select: { id: true, name: true, slug: true },
  });
  if (!product) notFound();

  const reviews = await db.review.findMany({
    where: { productId: product.id, deletedAt: null },
    orderBy: [{ createdAt: "desc" }],
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      reply: true,
    },
  });

  const published = reviews.filter((r) => r.status === "PUBLISHED");
  const flagged = reviews.filter((r) => r.status === "FLAGGED");
  const pending = reviews.filter((r) => r.status === "PENDING");

  const avg =
    published.length === 0
      ? 0
      : published.reduce((s, r) => s + r.rating, 0) / published.length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href={`/app/products/${product.id}/edit`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to product
      </Link>
      <header className="mt-3 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reviews - {product.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite customers, reply to feedback, and moderate flagged reviews.
          </p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 text-base font-semibold">
            <Star className="h-4 w-4" /> {avg.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground">
            {published.length} published
          </p>
        </div>
      </header>

      <section className="mt-8 rounded-lg border p-4">
        <h2 className="text-sm font-medium">Invite reviewers</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Paste customer emails (one per line or comma-separated). Each gets a
          single-use link. Reviews submitted via these links are marked{" "}
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Verified Customer
          </span>
          .
        </p>
        <div className="mt-3">
          <InviteReviewersForm productId={product.id} />
        </div>
      </section>

      {flagged.length > 0 ? (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Flag className="h-4 w-4" /> Flagged ({flagged.length})
          </h2>
          <ul className="mt-3 space-y-3">
            {flagged.map((r) => (
              <ReviewRow key={r.id} review={serialize(r)} />
            ))}
          </ul>
        </section>
      ) : null}

      {pending.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-sm font-medium text-muted-foreground">
            Pending ({pending.length})
          </h2>
          <ul className="mt-3 space-y-3">
            {pending.map((r) => (
              <ReviewRow key={r.id} review={serialize(r)} />
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-sm font-medium text-muted-foreground">
          Published ({published.length})
        </h2>
        {published.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No published reviews yet. Send a few invites above.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {published.map((r) => (
              <ReviewRow key={r.id} review={serialize(r)} />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        Public page:{" "}
        <Link href={`/products/${product.slug}`} className="underline">
          /products/{product.slug}
        </Link>
      </p>
    </div>
  );
}

type ReviewWithRelations = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorEmail: string | null;
  isVerified: boolean;
  isFlagged: boolean;
  fakeScore: number | null;
  status: string;
  createdAt: Date;
  author: { id: string; name: string | null; avatarUrl: string | null } | null;
  reply: { body: string; createdAt: Date } | null;
};

function serialize(r: ReviewWithRelations) {
  return {
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    authorName: r.author?.name ?? r.authorEmail?.split("@")[0] ?? "Anonymous",
    authorAvatar: r.author?.avatarUrl ?? null,
    isVerified: r.isVerified,
    isFlagged: r.isFlagged,
    fakeScore: r.fakeScore,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    reply: r.reply
      ? { body: r.reply.body, createdAt: r.reply.createdAt.toISOString() }
      : null,
  };
}

export type FounderReviewVm = ReturnType<typeof serialize>;
