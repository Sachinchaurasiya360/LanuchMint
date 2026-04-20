import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Github, Globe, Linkedin, MapPin, Twitter } from "lucide-react";
import { db } from "@launchmint/db";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
} from "@launchmint/ui";
import {
  breadcrumbJsonLd,
  buildMetadata,
  personJsonLd,
  renderJsonLd,
} from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const dynamic = "force-static";
export const revalidate = 300;

type Params = { slug: string };

async function getFounder(slug: string) {
  return db.founderProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      workspace: {
        include: {
          products: {
            where: { status: "LIVE", deletedAt: null },
            select: {
              id: true,
              name: true,
              tagline: true,
              slug: true,
              category: true,
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const founder = await getFounder(params.slug);
  if (!founder?.publishedAt) return { title: "Not found" };
  const bio = founder.bio?.trim() ?? "";
  const description =
    bio.length >= 60
      ? bio.slice(0, 160)
      : `${founder.displayName} - ${founder.headline ?? "indie founder"} on LaunchMint.`;
  // Thin profile = noindex. Keeps low-quality profiles out of SERPs.
  const thin = bio.length < 120 && founder.workspace.products.length === 0;
  return buildMetadata({
    title: `${founder.displayName}${founder.headline ? " - " + founder.headline : ""}`,
    description,
    path: `/founders/${founder.slug}`,
    image: founder.user?.avatarUrl ?? undefined,
    noindex: thin,
  });
}

export default async function FounderPage({ params }: { params: Params }) {
  const founder = await getFounder(params.slug);
  if (!founder?.publishedAt) notFound();

  const path = `/founders/${founder.slug}`;
  const sameAs = [
    founder.twitterUrl,
    founder.linkedinUrl,
    founder.githubUrl,
    founder.websiteUrl,
  ].filter(Boolean) as string[];

  const jsonLd = [
    personJsonLd({
      id: founder.id,
      name: founder.displayName,
      url: path,
      image: founder.user?.avatarUrl ?? undefined,
      jobTitle: founder.headline ?? undefined,
      sameAs,
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Founders", url: "/founders" },
      { name: founder.displayName, url: path },
    ]),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(jsonLd) }}
        />
        <Breadcrumbs
          items={[
            { name: "Founders", url: "/founders" },
            { name: founder.displayName, url: path },
          ]}
        />
        <div className="mt-4 flex items-start gap-4">
          <Avatar className="h-20 w-20">
            {founder.user?.avatarUrl ? (
              <AvatarImage src={founder.user.avatarUrl} alt={founder.displayName} />
            ) : null}
            <AvatarFallback>
              {founder.displayName
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {founder.displayName}
            </h1>
            {founder.headline ? (
              <p className="mt-1 text-base text-muted-foreground">
                {founder.headline}
              </p>
            ) : null}
            {founder.location ? (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {founder.location}
              </p>
            ) : null}
          </div>
          {founder.isVerified ? <Badge>Verified</Badge> : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {founder.websiteUrl ? (
            <a
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              href={founder.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="h-3 w-3" /> Website
            </a>
          ) : null}
          {founder.twitterUrl ? (
            <a
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              href={founder.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-3 w-3" /> Twitter
            </a>
          ) : null}
          {founder.linkedinUrl ? (
            <a
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              href={founder.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-3 w-3" /> LinkedIn
            </a>
          ) : null}
          {founder.githubUrl ? (
            <a
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              href={founder.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-3 w-3" /> GitHub
            </a>
          ) : null}
        </div>

        {founder.bio ? (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-muted-foreground">About</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-7">
              {founder.bio}
            </p>
          </section>
        ) : null}

        {founder.workspace.products.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-sm font-medium text-muted-foreground">
              Products
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {founder.workspace.products.map((p) => (
                <li key={p.id} className="rounded-lg border p-4">
                  <Link
                    href={`/products/${p.slug}`}
                    className="text-base font-semibold hover:underline"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                  <Badge variant="secondary" className="mt-3">
                    {p.category}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
