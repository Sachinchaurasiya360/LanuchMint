/**
 * Dev seed: 1 admin, 5 founders, the curated directory database, 10 products.
 * Run via: pnpm db:seed
 */
import { PrismaClient, WorkspaceType, Role, ProductStatus } from "@prisma/client";
import { DIRECTORY_DATA } from "./seeds/directories.js";

const db = new PrismaClient();

async function main() {
  console.info("Seeding LaunchMint dev database...");

  await db.user.upsert({
    where: { email: "admin@launchmint.com" },
    create: {
      email: "admin@launchmint.com",
      name: "LaunchMint Admin",
      isSuperAdmin: true,
      isModerator: true,
    },
    update: {},
  });

  await db.user.upsert({
    where: { email: "moderator@launchmint.com" },
    create: {
      email: "moderator@launchmint.com",
      name: "LaunchMint Moderator",
      isModerator: true,
    },
    update: {},
  });

  for (let i = 1; i <= 5; i++) {
    const email = `founder${i}@example.com`;
    const slug = `founder-${i}`;
    const user = await db.user.upsert({
      where: { email },
      create: { email, name: `Founder ${i}` },
      update: {},
    });

    const workspace = await db.workspace.upsert({
      where: { slug: `founder-${i}-workspace` },
      create: {
        slug: `founder-${i}-workspace`,
        name: `${user.name}'s Workspace`,
        type: WorkspaceType.FOUNDER,
      },
      update: {},
    });

    await db.workspaceMember.upsert({
      where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
      create: {
        userId: user.id,
        workspaceId: workspace.id,
        role: Role.OWNER,
      },
      update: {},
    });

    await db.founderProfile.upsert({
      where: { workspaceId: workspace.id },
      create: {
        workspaceId: workspace.id,
        userId: user.id,
        slug,
        displayName: user.name ?? `Founder ${i}`,
        headline: `Founder of Demo Product ${i}`,
        bio: "Building in public. Solo SaaS founder.",
      },
      update: {},
    });
  }

  for (const dir of DIRECTORY_DATA) {
    await db.directory.upsert({
      where: { slug: dir.slug },
      create: {
        slug: dir.slug,
        name: dir.name,
        url: dir.url,
        submitUrl: dir.submitUrl,
        description: dir.description,
        category: dir.category,
        niche: dir.niche,
        domainRating: dir.domainRating,
        cost: dir.cost,
        acceptanceRate: dir.acceptanceRate,
        reviewSpeed: dir.reviewSpeed,
        hasApi: dir.hasApi ?? false,
        apiNotes: dir.apiNotes,
      },
      update: {},
    });
  }

  console.info(`Seed complete. ${DIRECTORY_DATA.length} directories upserted.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
