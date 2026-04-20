import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { buildMetadata, SITE } from "@launchmint/seo-meta";
import {
  organizationJsonLd,
  renderJsonLd,
  websiteJsonLd,
} from "@launchmint/seo-meta";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const base = buildMetadata({
  title: "LaunchMint - Turn visibility into velocity.",
  description:
    "SEO-first launch, review, and growth platform for solo founders. Launch your product, collect verified reviews, and rank in search.",
  path: "/",
});

export const metadata: Metadata = {
  ...base,
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: { email: false, address: false, telephone: false },
  verification: {
    google: SITE.verification.google,
    yandex: SITE.verification.yandex,
    other: SITE.verification.bing
      ? { "msvalidate.01": [SITE.verification.bing] }
      : undefined,
  },
};

export const viewport = {
  themeColor: "#FACC15",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: renderJsonLd([organizationJsonLd(), websiteJsonLd()]),
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div id="page-content">{children}</div>
      </body>
    </html>
  );
}
