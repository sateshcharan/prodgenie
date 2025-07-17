import { Worker } from 'bullmq';

import { processDrawingBom } from './processor.js';

import connection from '@prodgenie/libs/redis';

const worker = new Worker('file-processing', processDrawingBom, connection);

worker.on('active', (job) => {
  console.error(`🚀 Job ${job.id} started`);
});

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});
