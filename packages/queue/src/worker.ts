import { Worker, type Job, type WorkerOptions } from "bullmq";
import { getRedis } from "./connection.js";
import type { JobMap, JobName, QueueName } from "./jobs.js";

export type Handler<N extends JobName> = (data: JobMap[N], job: Job) => Promise<void>;

export type HandlerMap = {
  [N in JobName]?: Handler<N>;
};

export function createWorker(
  queueName: QueueName,
  handlers: HandlerMap,
  opts?: Partial<WorkerOptions>,
): Worker {
  return new Worker(
    queueName,
    async (job: Job) => {
      const handler = handlers[job.name as JobName] as
        | Handler<JobName>
        | undefined;
      if (!handler) {
        throw new Error(`No handler registered for job '${job.name}' in queue '${queueName}'`);
      }
      await handler(job.data as JobMap[JobName], job);
    },
    {
      connection: getRedis(),
      concurrency: 4,
      ...opts,
    },
  );
}
