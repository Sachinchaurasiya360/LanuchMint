/**
 * Canonical category list - mirrors the new-product form.
 * Kept here so the public `/categories/*` and `/best/*` routes agree with
 * what founders can pick on create.
 */
export const CATEGORIES = [
  "Productivity",
  "Developer Tools",
  "Marketing",
  "Sales",
  "Analytics",
  "Design",
  "AI",
  "SaaS",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BY_SLUG = new Map<string, Category>(
  CATEGORIES.map((c) => [categorySlug(c), c]),
);

export function categoryFromSlug(slug: string): Category | null {
  return BY_SLUG.get(slug) ?? null;
}

export function allCategorySlugs(): string[] {
  return CATEGORIES.map(categorySlug);
}
