import { QUEUE_NAMES, createWorker, getQueue } from "@launchmint/queue";
import { aiHandlers } from "./handlers/ai.js";
import { directoryHandlers } from "./handlers/directory.js";
import { emailHandlers } from "./handlers/email.js";
import { launchHandlers } from "./handlers/launch.js";
import { moderationHandlers } from "./handlers/moderation.js";
import { searchHandlers } from "./handlers/search.js";
import { seoHandlers } from "./handlers/seo.js";
import { captureError, flushSentry, initSentry } from "./sentry.js";

initSentry();

const workers = [
  createWorker(QUEUE_NAMES.email, emailHandlers, { concurrency: 8 }),
  createWorker(QUEUE_NAMES.ai, aiHandlers, { concurrency: 4 }),
  createWorker(QUEUE_NAMES.seo, seoHandlers, { concurrency: 2 }),
  createWorker(QUEUE_NAMES.search, searchHandlers, { concurrency: 4 }),
  createWorker(QUEUE_NAMES.moderation, moderationHandlers, { concurrency: 4 }),
  createWorker(QUEUE_NAMES.launch, launchHandlers, { concurrency: 1 }),
  createWorker(QUEUE_NAMES.directory, directoryHandlers, { concurrency: 2 }),
];

for (const w of workers) {
  w.on("completed", (job) => {
    console.log(`[${w.name}] ${job.name} ✓`);
  });
  w.on("failed", (job, err) => {
    console.error(`[${w.name}] ${job?.name} ✗ ${err.message}`);
    captureError(err, { queue: w.name, jobName: job?.name, jobId: job?.id });
  });
}

// Schedule the launch tick every minute. BullMQ dedupes by jobId on the
// repeatable entry, so multiple worker instances stay safe.
async function bootstrapLaunchTick() {
  const q = getQueue(QUEUE_NAMES.launch);
  await q.add(
    "launch-tick",
    {},
    {
      repeat: { pattern: "*/1 * * * *" },
      jobId: "launch-tick:repeat",
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}

// Directory backlink verifier runs once per day at 03:17 UTC - chosen to
// land outside typical launch-day spikes.
async function bootstrapDirectoryVerifyTick() {
  const q = getQueue(QUEUE_NAMES.directory);
  await q.add(
    "directory-verify-tick",
    {},
    {
      repeat: { pattern: "17 3 * * *" },
      jobId: "directory-verify-tick:repeat",
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}

// Daily SEO snapshot + MRR pull. Kept on the seo queue to serialize
// DataForSEO / Stripe calls against per-worker concurrency.
async function bootstrapSeoTicks() {
  const q = getQueue(QUEUE_NAMES.seo);
  await q.add(
    "seo-snapshot-tick",
    {},
    {
      repeat: { pattern: "41 2 * * *" },
      jobId: "seo-snapshot-tick:repeat",
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
  await q.add(
    "verify-mrr-tick",
    {},
    {
      repeat: { pattern: "7 4 * * *" },
      jobId: "verify-mrr-tick:repeat",
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}

bootstrapLaunchTick().catch((err) => {
  console.error("failed to schedule launch-tick", err);
});
bootstrapDirectoryVerifyTick().catch((err) => {
  console.error("failed to schedule directory-verify-tick", err);
});
bootstrapSeoTicks().catch((err) => {
  console.error("failed to schedule seo/mrr ticks", err);
});

console.log(
  `LaunchMint worker started. Listening on: ${workers.map((w) => w.name).join(", ")}`,
);

async function shutdown() {
  console.log("shutting down workers...");
  await Promise.all(workers.map((w) => w.close()));
  await flushSentry();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
