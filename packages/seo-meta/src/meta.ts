import { SITE, abs } from "./site.js";

export interface MetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}

export interface NextMetadata {
  title: string;
  description: string;
  alternates: { canonical: string };
  robots: {
    index: boolean;
    follow: boolean;
    googleBot: {
      index: boolean;
      follow: boolean;
      "max-image-preview": "large";
      "max-snippet": number;
      "max-video-preview": number;
    };
  };
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images: { url: string; width: number; height: number }[];
    type: "website";
    locale: "en_US";
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
    site: string;
    creator: string;
  };
}

export function buildMetadata(input: MetaInput): NextMetadata {
  const url = abs(input.path);
  const image = abs(input.image ?? "/og/default.png");
  const indexable = !input.noindex;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: SITE.name,
      images: [{ url: image, width: 1200, height: 630 }],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
      site: SITE.twitter,
      creator: SITE.twitter,
    },
  };
}
