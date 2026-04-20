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

export interface OfferInput {
  name: string;
  description: string;
  price: number;
  currency?: string;
  url: string;
  features?: string[];
}

/**
 * Emit a Product + Offer per pricing plan. Powers price rich-results and
 * gives AI engines a structured answer for "how much does X cost".
 */
export function offerProductJsonLd(o: OfferInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${abs(o.url)}#plan-${o.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: o.name,
    description: o.description,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      price: o.price.toString(),
      priceCurrency: o.currency ?? "USD",
      url: abs(o.url),
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: o.price,
        priceCurrency: o.currency ?? "USD",
        unitCode: "MON",
        billingIncrement: 1,
      },
    },
    additionalProperty: o.features?.map((f) => ({
      "@type": "PropertyValue",
      name: "feature",
      value: f,
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQPage - critical for AEO (answer engines). Google, Bing, and ChatGPT all
 * preferentially cite FAQPage-tagged content in Q&A surfaces.
 */
export function faqJsonLd(items: FaqItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export interface HowToInput {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration, e.g. "PT15M"
  steps: HowToStep[];
}

/**
 * HowTo - used on onboarding/guide pages. Cited heavily by AI Overviews when
 * the query has procedural intent ("how to launch on ...", "how to submit to").
 */
export function howToJsonLd(input: HowToInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    totalTime: input.totalTime,
    step: input.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: s.url ? abs(s.url) : undefined,
      image: s.image ? abs(s.image) : undefined,
    })),
  };
}

export interface ArticleInput {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: { name: string; url?: string };
  wordCount?: number;
}

/**
 * Article - for launch writeups and blog posts. Powers Top Stories + News
 * surfaces and is a strong AI Overview citation signal.
 */
export function articleJsonLd(a: ArticleInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${abs(a.url)}#article`,
    headline: a.headline,
    description: a.description,
    url: abs(a.url),
    image: a.image ? abs(a.image) : undefined,
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    author: {
      "@type": "Person",
      name: a.author.name,
      url: a.author.url ? abs(a.author.url) : undefined,
    },
    publisher: { "@id": `${SITE.url}/#organization` },
    mainEntityOfPage: abs(a.url),
    wordCount: a.wordCount,
  };
}

/**
 * Render a JSON-LD object to a string suitable for a <script type="application/ld+json"> tag.
 * Strips undefined values to keep payloads small.
 */
export function renderJsonLd(obj: JsonLd | JsonLd[]): string {
  return JSON.stringify(obj, (_k, v) => (v === undefined ? undefined : v));
}
