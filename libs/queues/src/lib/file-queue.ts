import { Queue } from 'bullmq';

import { connection } from '@prodgenie/libs/redis';

export const fileProcessingQueue = new Queue('file-processing', { connection });

(async () => {
  // Remove all jobs from the queue (waiting, delayed, active, failed, completed)
  await fileProcessingQueue.drain(true); // true = also remove active jobs
  await fileProcessingQueue.clean(0, 0, 'delayed');
  await fileProcessingQueue.clean(0, 0, 'wait');
  await fileProcessingQueue.clean(0, 0, 'failed');
  await fileProcessingQueue.clean(0, 0, 'completed');
  console.log('file-processing Queue cleaned');
})();
