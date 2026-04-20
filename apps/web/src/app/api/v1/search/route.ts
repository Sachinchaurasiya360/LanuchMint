import { NextResponse } from "next/server";
import { searchDocs } from "@launchmint/search";

export const runtime = "nodejs";

type Kind = "products" | "founders" | "directories";

interface Hit {
  kind: Kind;
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  href: string;
}

const QUERY_BY: Record<Kind, string> = {
  products: "name,tagline,description,tags",
  founders: "displayName,headline,bio",
  directories: "name,description",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ hits: [] });

  const requested =
    (url.searchParams.get("kinds")?.split(",").filter(Boolean) as Kind[] | undefined) ??
    (["products", "founders", "directories"] as Kind[]);
  const limit = Math.min(20, Number(url.searchParams.get("limit") ?? 6));

  const results = await Promise.allSettled(
    requested.map(async (kind) => {
      const res = await searchDocs<Record<string, unknown>>({
        collection: kind,
        q,
        queryBy: QUERY_BY[kind],
        perPage: limit,
      });
      return { kind, res };
    }),
  );

  const hits: Hit[] = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const { kind, res } = r.value;
    for (const h of res.hits) {
      const d = h.document as Record<string, string | number | undefined>;
      if (kind === "products") {
        hits.push({
          kind,
          id: String(d.id),
          slug: String(d.slug),
          title: String(d.name),
          subtitle: d.tagline ? String(d.tagline) : undefined,
          imageUrl: d.logoUrl ? String(d.logoUrl) : undefined,
          href: `/products/${d.slug}`,
        });
      } else if (kind === "founders") {
        hits.push({
          kind,
          id: String(d.id),
          slug: String(d.slug),
          title: String(d.displayName),
          subtitle: d.headline ? String(d.headline) : undefined,
          href: `/founders/${d.slug}`,
        });
      } else {
        hits.push({
          kind,
          id: String(d.id),
          slug: String(d.slug),
          title: String(d.name),
          subtitle: d.description ? String(d.description).slice(0, 120) : undefined,
          href: `/directories/${d.slug}`,
        });
      }
    }
  }

  return NextResponse.json({ hits });
}
