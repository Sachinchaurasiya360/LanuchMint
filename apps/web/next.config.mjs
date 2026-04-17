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
};

export default nextConfig;
