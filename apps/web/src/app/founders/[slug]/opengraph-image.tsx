import { ImageResponse } from "next/og";
import { db } from "@launchmint/db";
import { OG_SIZE, OG_CONTENT_TYPE, ogTemplate } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "LaunchMint founder";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const f = await db.founderProfile.findUnique({
    where: { slug: params.slug },
    select: { displayName: true, headline: true, location: true },
  });
  if (!f) {
    return new ImageResponse(
      ogTemplate({ eyebrow: "Founder", title: "Not found" }),
      size,
    );
  }
  return new ImageResponse(
    ogTemplate({
      eyebrow: f.location ? `Founder · ${f.location}` : "Founder",
      title: f.displayName,
      subtitle: (f.headline ?? "").slice(0, 140),
    }),
    size,
  );
}
