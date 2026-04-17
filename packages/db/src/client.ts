import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __launchmintPrisma: PrismaClient | undefined;
}

const isProd = process.env.NODE_ENV === "production";

export const db: PrismaClient =
  globalThis.__launchmintPrisma ??
  new PrismaClient({
    log: isProd ? ["warn", "error"] : ["query", "warn", "error"],
  });

if (!isProd) {
  globalThis.__launchmintPrisma = db;
}
