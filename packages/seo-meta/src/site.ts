export const SITE = {
  name: "LaunchMint",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://launchmint.com",
  description: "Turn visibility into velocity. Launch, get reviews, and grow with SEO.",
  logo: "/brand/logo.svg",
  twitter: "@launchmint",
} as const;

export function abs(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
