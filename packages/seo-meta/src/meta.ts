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
  robots: { index: boolean; follow: boolean };
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images: { url: string }[];
    type: "website";
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
}

export function buildMetadata(input: MetaInput): NextMetadata {
  const url = abs(input.path);
  const image = abs(input.image ?? "/og/default.png");
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: { index: !input.noindex, follow: !input.noindex },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: SITE.name,
      images: [{ url: image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
