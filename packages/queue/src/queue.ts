import { Queue, type JobsOptions } from "bullmq";
import { getRedis } from "./connection.js";
import { JOB_TO_QUEUE, type JobMap, type JobName, type QueueName } from "./jobs.js";

const queues = new Map<QueueName, Queue>();

export function getQueue(name: QueueName): Queue {
  let q = queues.get(name);
  if (!q) {
    q = new Queue(name, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: { count: 1_000, age: 60 * 60 * 24 },
        removeOnFail: { count: 5_000, age: 60 * 60 * 24 * 7 },
      },
    });
    queues.set(name, q);
  }
  return q;
}

export async function enqueue<N extends JobName>(
  name: N,
  data: JobMap[N],
  opts?: JobsOptions,
): Promise<void> {
  const queueName = JOB_TO_QUEUE[name];
  await getQueue(queueName).add(name, data, opts);
}
