/**
 * Standalone seeder for the curated directory database. Idempotent - re-run
 * to refresh metadata after edits to `directories.ts`.
 *
 * Usage: pnpm --filter @launchmint/db seed:directories
 */
import { PrismaClient } from "@prisma/client";
import { DIRECTORY_DATA } from "./directories.js";

const db = new PrismaClient();

async function main() {
  console.info(`Seeding ${DIRECTORY_DATA.length} directories...`);
  let created = 0;
  let updated = 0;
  for (const d of DIRECTORY_DATA) {
    const result = await db.directory.upsert({
      where: { slug: d.slug },
      create: {
        slug: d.slug,
        name: d.name,
        url: d.url,
        submitUrl: d.submitUrl,
        description: d.description,
        category: d.category,
        niche: d.niche,
        domainRating: d.domainRating,
        cost: d.cost,
        acceptanceRate: d.acceptanceRate,
        reviewSpeed: d.reviewSpeed,
        hasApi: d.hasApi ?? false,
        apiNotes: d.apiNotes,
      },
      update: {
        name: d.name,
        url: d.url,
        submitUrl: d.submitUrl,
        description: d.description,
        category: d.category,
        niche: d.niche,
        domainRating: d.domainRating,
        cost: d.cost,
        acceptanceRate: d.acceptanceRate,
        reviewSpeed: d.reviewSpeed,
        hasApi: d.hasApi ?? false,
        apiNotes: d.apiNotes,
      },
    });
    if (result.createdAt.getTime() === result.updatedAt.getTime()) created += 1;
    else updated += 1;
  }
  console.info(`Done. created=${created}, updated=${updated}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
