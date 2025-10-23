import { Worker } from 'bullmq';

import connection from '@prodgenie/libs/redis';

import { processGenerateJobCard } from './processor.js';

const worker = new Worker(
  'generateJobCard',
  processGenerateJobCard,
  connection
);

worker.on('active', (job) => {
  console.error(`🚀 Job ${job.id} started`);
});

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});
