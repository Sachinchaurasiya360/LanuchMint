import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogTemplate } from "@/lib/og-template";
import { categoryFromSlug } from "@/lib/categories";

export const runtime = "edge";
export const alt = "Best-of on LaunchMint";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage({ params }: { params: { category: string } }) {
  const category = categoryFromSlug(params.category) ?? params.category;
  const year = new Date().getUTCFullYear();
  return new ImageResponse(
    ogTemplate({
      eyebrow: `Best of ${year}`,
      title: `Best ${category.toLowerCase()} startups`,
      subtitle: "Ranked by upvotes, reviews, and verified MRR.",
      footer: "launchmint.com/best",
    }),
    size,
  );
}
