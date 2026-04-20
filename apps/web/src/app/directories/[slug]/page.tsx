import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Gauge, ShieldCheck, Timer } from "lucide-react";
import { db } from "@launchmint/db";
import { Badge, Button } from "@launchmint/ui";
import {
  breadcrumbJsonLd,
  buildMetadata,
  renderJsonLd,
} from "@launchmint/seo-meta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const revalidate = 86_400;

type Params = { slug: string };

async function getDirectory(slug: string) {
  return db.directory.findFirst({
    where: { slug, status: "ACTIVE" },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const dir = await getDirectory(params.slug);
  if (!dir) return { title: "Not found" };
  return buildMetadata({
    title: `${dir.name} - Submit your startup | LaunchMint`,
    description:
      dir.description.length > 155
        ? dir.description.slice(0, 152) + "..."
        : dir.description,
    path: `/directories/${dir.slug}`,
  });
}

export default async function DirectoryDetailPage({
  params,
}: {
  params: Params;
}) {
  const dir = await getDirectory(params.slug);
  if (!dir) notFound();

  const recentlyLive = await db.directorySubmission.findMany({
    where: { directoryId: dir.id, status: "LIVE" },
    orderBy: { livedAt: "desc" },
    take: 8,
    include: {
      product: { select: { name: true, slug: true, logoUrl: true } },
    },
  });

  const path = `/directories/${dir.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${path}#service`,
      name: dir.name,
      description: dir.description,
      url: dir.url,
      areaServed: "Worldwide",
      serviceType: "Startup directory listing",
    },
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Directories", url: "/directories" },
      { name: dir.name, url: path },
    ]),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(jsonLd) }}
        />
        <nav className="text-xs text-muted-foreground">
          <Link href="/directories" className="hover:underline">
            ← All directories
          </Link>
        </nav>
        <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">{dir.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{dir.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              <Badge>{dir.cost}</Badge>
              {dir.hasApi ? <Badge variant="secondary">API submission</Badge> : null}
              {dir.category.map((c) => (
                <Badge key={c} variant="outline">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <Button asChild>
            <a href={dir.submitUrl ?? dir.url} target="_blank" rel="noopener noreferrer">
              Visit directory <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </header>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat
            icon={<Gauge className="h-4 w-4" />}
            label="Domain rating"
            value={dir.domainRating != null ? String(dir.domainRating) : "-"}
          />
          <Stat
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Acceptance rate"
            value={dir.acceptanceRate ?? "-"}
          />
          <Stat
            icon={<Timer className="h-4 w-4" />}
            label="Review speed"
            value={dir.reviewSpeed ?? "-"}
          />
        </section>

        {dir.niche ? (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Best for</h2>
            <p className="mt-2 text-sm text-muted-foreground">{dir.niche}</p>
          </section>
        ) : null}

        {dir.apiNotes ? (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Submission notes</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
              {dir.apiNotes}
            </p>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Recent LaunchMint products listed here</h2>
          {recentlyLive.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No products listed here yet via LaunchMint.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {recentlyLive.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  {s.product.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.product.logoUrl}
                      alt=""
                      className="h-9 w-9 rounded border"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded border bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${s.product.slug}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {s.product.name}
                    </Link>
                    {s.liveUrl ? (
                      <a
                        href={s.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs text-muted-foreground hover:text-foreground"
                      >
                        Listing page
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10 rounded-lg border bg-yellow-50 p-4">
          <h2 className="text-base font-semibold">Submit with LaunchMint</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect a product and we'll generate tailored submission copy, then
            track the listing until your backlink goes live.
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/app/products">Open dashboard</Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
