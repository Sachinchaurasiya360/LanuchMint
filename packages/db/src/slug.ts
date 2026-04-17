import { db } from "./client.js";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type SlugTable = "product" | "founderProfile" | "workspace" | "directory";

export async function ensureUniqueSlug(
  table: SlugTable,
  base: string,
): Promise<string> {
  const root = slugify(base) || table;
  let slug = root;
  let n = 1;
  // best-effort uniqueness (race-tolerant via DB unique index)
  while (await exists(table, slug)) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

async function exists(table: SlugTable, slug: string): Promise<boolean> {
  switch (table) {
    case "product":
      return Boolean(
        await db.product.findUnique({ where: { slug }, select: { id: true } }),
      );
    case "founderProfile":
      return Boolean(
        await db.founderProfile.findUnique({
          where: { slug },
          select: { id: true },
        }),
      );
    case "workspace":
      return Boolean(
        await db.workspace.findUnique({ where: { slug }, select: { id: true } }),
      );
    case "directory":
      return Boolean(
        await db.directory.findUnique({ where: { slug }, select: { id: true } }),
      );
  }
}
