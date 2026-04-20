import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogTemplate } from "@/lib/og-template";
import { categoryFromSlug } from "@/lib/categories";

export const runtime = "edge";
export const alt = "Category on LaunchMint";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage({ params }: { params: { slug: string } }) {
  const category = categoryFromSlug(params.slug) ?? params.slug;
  return new ImageResponse(
    ogTemplate({
      eyebrow: "Category",
      title: category,
      subtitle: `Every ${category.toLowerCase()} product shipped on LaunchMint.`,
      footer: "launchmint.com/categories",
    }),
    size,
  );
}
