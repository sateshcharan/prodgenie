import { Queue } from 'bullmq';

import { redis } from '@prodgenie/libs/redis';

export const jobCardQueue = new Queue('generateJobCard', { connection: redis });

(async () => {
  // Remove all jobs from the queue (waiting, delayed, active, failed, completed)
  await jobCardQueue.drain(true);
  await jobCardQueue.clean(0, 0, 'delayed');
  await jobCardQueue.clean(0, 0, 'wait');
  await jobCardQueue.clean(0, 0, 'failed');
  await jobCardQueue.clean(0, 0, 'completed');
  console.log('generateJobCard Queue cleaned');
})();
