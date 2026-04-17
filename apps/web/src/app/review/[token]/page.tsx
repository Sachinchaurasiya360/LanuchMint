import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { db } from "@launchmint/db";
import { verifyReviewInvite } from "@launchmint/auth";
import { Badge } from "@launchmint/ui";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ReviewSubmitForm } from "./review-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Write a review — LaunchMint",
  description: "Submit a verified review using your invite link.",
  robots: { index: false, follow: false },
};

interface Params {
  token: string;
}

export default async function PublicReviewPage({ params }: { params: Params }) {
  const verified = verifyReviewInvite(params.token);
  if (!verified.ok) {
    return (
      <ReviewShell>
        <h1 className="text-2xl font-semibold">Link is no longer valid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {verified.reason === "EXPIRED"
            ? "This invite expired. Ask the founder to send a new one."
            : "This invite link is invalid. Ask the founder to send a new one."}
        </p>
      </ReviewShell>
    );
  }

  const { productId, email } = verified.payload;
  const product = await db.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true, name: true, slug: true, tagline: true, logoUrl: true, category: true },
  });
  if (!product) notFound();

  const existing = await db.review.findFirst({
    where: { productId, authorEmail: email },
    select: { id: true, status: true },
  });
  if (existing) {
    return (
      <ReviewShell>
        <h1 className="text-2xl font-semibold">You've already reviewed {product.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks for the feedback.{" "}
          <Link href={`/products/${product.slug}`} className="underline">
            View the product page
          </Link>
          .
        </p>
      </ReviewShell>
    );
  }

  return (
    <ReviewShell>
      <div className="flex items-start gap-3">
        {product.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.logoUrl}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-md border"
          />
        ) : null}
        <div>
          <Badge variant="secondary">{product.category}</Badge>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Review {product.name}
          </h1>
          <p className="text-sm text-muted-foreground">{product.tagline}</p>
        </div>
      </div>
      <p className="mt-6 inline-flex items-center gap-2 rounded-md bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3 w-3" /> Submitting as {email}. Your review
        will display the "Verified Customer" badge.
      </p>
      <div className="mt-6">
        <ReviewSubmitForm token={params.token} productSlug={product.slug} />
      </div>
    </ReviewShell>
  );
}

function ReviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">{children}</main>
      <SiteFooter />
    </div>
  );
}
