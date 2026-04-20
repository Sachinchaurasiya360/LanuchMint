import { ImageResponse } from "next/og";
import { db } from "@launchmint/db";
import { OG_SIZE, OG_CONTENT_TYPE, ogTemplate } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "Directory on LaunchMint";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const d = await db.directory.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, domainRating: true },
  });
  if (!d) {
    return new ImageResponse(
      ogTemplate({ eyebrow: "Directory", title: "Not found" }),
      size,
    );
  }
  const eyebrow = d.domainRating
    ? `Directory · DR ${d.domainRating}`
    : "Directory";
  return new ImageResponse(
    ogTemplate({
      eyebrow,
      title: d.name,
      subtitle: (d.description ?? "").slice(0, 140),
    }),
    size,
  );
}
