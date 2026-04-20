import { ImageResponse } from "next/og";
import { db } from "@launchmint/db";
import { OG_SIZE, OG_CONTENT_TYPE, ogTemplate } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "Compare on LaunchMint";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const [aSlug, bSlug] = params.slug.split("-vs-");
  if (!aSlug || !bSlug) {
    return new ImageResponse(
      ogTemplate({ eyebrow: "Compare", title: "Not found" }),
      size,
    );
  }
  const [a, b] = await Promise.all([
    db.product.findUnique({
      where: { slug: aSlug },
      select: { name: true, category: true },
    }),
    db.product.findUnique({
      where: { slug: bSlug },
      select: { name: true, category: true },
    }),
  ]);
  if (!a || !b) {
    return new ImageResponse(
      ogTemplate({ eyebrow: "Compare", title: "Not found" }),
      size,
    );
  }
  return new ImageResponse(
    ogTemplate({
      eyebrow:
        a.category === b.category ? `Compare · ${a.category}` : "Compare",
      title: `${a.name} vs ${b.name}`,
      subtitle:
        "Side-by-side: upvotes, reviews, verified MRR, and founder ships.",
      footer: "launchmint.com/compare",
    }),
    size,
  );
}
