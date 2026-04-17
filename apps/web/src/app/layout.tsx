import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { buildMetadata } from "@launchmint/seo-meta";
import {
  organizationJsonLd,
  renderJsonLd,
  websiteJsonLd,
} from "@launchmint/seo-meta";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = buildMetadata({
  title: "LaunchMint — Turn visibility into velocity.",
  description:
    "SEO-first launch, review, and growth platform for solo founders. Launch your product, collect verified reviews, and rank in search.",
  path: "/",
});

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
        {children}
      </body>
    </html>
  );
}
