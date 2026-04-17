import { SITE, abs } from "./site.js";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: abs(SITE.logo),
    sameAs: [`https://twitter.com/${SITE.twitter.replace("@", "")}`],
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    publisher: { "@id": `${SITE.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export interface PersonInput {
  id: string;
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  worksFor?: string;
  sameAs?: string[];
}

export function personJsonLd(p: PersonInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${abs(p.url)}#person`,
    name: p.name,
    url: abs(p.url),
    image: p.image ? abs(p.image) : undefined,
    jobTitle: p.jobTitle,
    worksFor: p.worksFor ? { "@type": "Organization", name: p.worksFor } : undefined,
    sameAs: p.sameAs,
  };
}

export interface ProductInput {
  slug: string;
  name: string;
  description: string;
  image?: string;
  category?: string;
  url: string;
  rating?: { value: number; count: number };
  founder?: { name: string; url: string };
}

export function softwareApplicationJsonLd(p: ProductInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${abs(p.url)}#product`,
    name: p.name,
    description: p.description,
    url: abs(p.url),
    image: p.image ? abs(p.image) : undefined,
    applicationCategory: p.category ?? "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating:
      p.rating && p.rating.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: p.rating.value,
            ratingCount: p.rating.count,
          }
        : undefined,
    creator: p.founder
      ? { "@type": "Person", name: p.founder.name, url: abs(p.founder.url) }
      : undefined,
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

export interface ReviewInput {
  id: string;
  productSlug: string;
  productName: string;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
  publishedAt: string;
}

export function reviewJsonLd(r: ReviewInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "@id": `${SITE.url}/p/${r.productSlug}/reviews/${r.id}#review`,
    itemReviewed: {
      "@type": "SoftwareApplication",
      name: r.productName,
      url: abs(`/p/${r.productSlug}`),
    },
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    name: r.title,
    reviewBody: r.body,
    author: { "@type": "Person", name: r.authorName },
    datePublished: r.publishedAt,
  };
}

export interface CollectionInput {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string }>;
}

export function collectionPageJsonLd(c: CollectionInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${abs(c.url)}#collection`,
    name: c.name,
    description: c.description,
    url: abs(c.url),
    isPartOf: { "@id": `${SITE.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: c.items.length,
      itemListElement: c.items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: abs(it.url),
        name: it.name,
      })),
    },
  };
}

/**
 * Render a JSON-LD object to a string suitable for a <script type="application/ld+json"> tag.
 * Strips undefined values to keep payloads small.
 */
export function renderJsonLd(obj: JsonLd | JsonLd[]): string {
  return JSON.stringify(obj, (_k, v) => (v === undefined ? undefined : v));
}
