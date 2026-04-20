import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { db } from "@launchmint/db";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Input,
} from "@launchmint/ui";
import {
  breadcrumbJsonLd,
  buildMetadata,
  collectionPageJsonLd,
  renderJsonLd,
} from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Founders on LaunchMint",
  description:
    "Meet the founders shipping startups on LaunchMint - browse by location, expertise, and products launched.",
  path: "/founders",
});

type SearchParams = {
  q?: string;
  location?: string;
};

export default async function FoundersIndex({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = (searchParams.q ?? "").trim().slice(0, 80);
  const location = (searchParams.location ?? "").trim().slice(0, 60);

  const founders = await db.founderProfile.findMany({
    where: {
      publishedAt: { not: null },
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: "insensitive" as const } },
              { headline: { contains: q, mode: "insensitive" as const } },
              { bio: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(location
        ? { location: { contains: location, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
    include: {
      user: { select: { avatarUrl: true, name: true } },
      workspace: {
        select: {
          _count: {
            select: {
              products: { where: { status: "LIVE", deletedAt: null } },
            },
          },
        },
      },
    },
  });

  const locationOptions = await topLocations();

  const jsonLd = [
    collectionPageJsonLd({
      name: "Founders on LaunchMint",
      description: "Directory of founders shipping startups on LaunchMint.",
      url: "/founders",
      items: founders.slice(0, 50).map((f) => ({
        name: f.displayName,
        url: `/founders/${f.slug}`,
      })),
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Founders", url: "/founders" },
    ]),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(jsonLd) }}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Founders</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {founders.length} founders publicly building on LaunchMint.
          </p>
        </header>

        <form className="mt-6 flex flex-wrap gap-2" action="/founders">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search by name, headline, or bio"
            className="sm:w-80"
          />
          <Input
            name="location"
            defaultValue={location}
            placeholder="Location"
            className="sm:w-56"
          />
          <button
            type="submit"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-secondary/40"
          >
            Filter
          </button>
        </form>

        {locationOptions.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {locationOptions.map((loc) => (
              <Link
                key={loc}
                href={`/founders?location=${encodeURIComponent(loc)}`}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:bg-secondary/40"
              >
                <MapPin className="h-3 w-3" /> {loc}
              </Link>
            ))}
          </div>
        ) : null}

        {founders.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No founders match that filter.
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {founders.map((f) => {
              const name = f.displayName;
              const initial = name[0]?.toUpperCase() ?? "?";
              const productCount = f.workspace?._count.products ?? 0;
              return (
                <li key={f.id} className="rounded-lg border p-4">
                  <Link
                    href={`/founders/${f.slug}`}
                    className="flex items-start gap-3"
                  >
                    <Avatar className="h-10 w-10">
                      {f.user?.avatarUrl ? (
                        <AvatarImage src={f.user.avatarUrl} alt={name} />
                      ) : null}
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{name}</p>
                      {f.headline ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {f.headline}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {f.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {f.location}
                          </span>
                        ) : null}
                        {productCount > 0 ? (
                          <Badge variant="secondary">
                            {productCount}{" "}
                            {productCount === 1 ? "product" : "products"}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

async function topLocations(): Promise<string[]> {
  const rows = await db.founderProfile.findMany({
    where: {
      publishedAt: { not: null },
      deletedAt: null,
      location: { not: null },
    },
    select: { location: true },
    take: 500,
  });
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (!r.location) continue;
    counts.set(r.location, (counts.get(r.location) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([loc]) => loc);
}
