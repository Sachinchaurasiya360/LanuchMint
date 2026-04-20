/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@launchmint/ai",
    "@launchmint/analytics",
    "@launchmint/auth",
    "@launchmint/billing",
    "@launchmint/config",
    "@launchmint/db",
    "@launchmint/email",
    "@launchmint/queue",
    "@launchmint/search",
    "@launchmint/seo-data",
    "@launchmint/seo-meta",
    "@launchmint/storage",
    "@launchmint/ui",
  ],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bullmq", "ioredis"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

// Sentry is opt-in via env. Import lazily so local dev doesn't require the
// @sentry/nextjs package to be installed when no DSN is configured.
const sentryEnabled = Boolean(
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
);

export default sentryEnabled
  ? (async () => {
      const { withSentryConfig } = await import("@sentry/nextjs");
      return withSentryConfig(nextConfig, {
        silent: true,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        widenClientFileUpload: true,
        hideSourceMaps: true,
        disableLogger: true,
      });
    })()
  : nextConfig;
