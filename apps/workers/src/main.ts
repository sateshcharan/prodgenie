import { Worker } from 'bullmq';
import { connection } from '@prodgenie/libs/redis';
import { processDrawingBom } from './processors/file-processor.js';
import { processGenerateJobCard } from './processors/job-card-processor.js';

// Recommended concurrency settings:
// - Heavy image/PDF/CAD: 1
// - Light data operations: 2–5
// Adjust as needed:
const FILE_WORKER_CONCURRENCY = Number(
  process.env.FILE_WORKER_CONCURRENCY ?? 1
);
const JOB_CARD_WORKER_CONCURRENCY = Number(
  process.env.JOB_CARD_WORKER_CONCURRENCY ?? 1
);

const fileWorker = new Worker('file-processing', processDrawingBom, {
  connection,
  concurrency: FILE_WORKER_CONCURRENCY,
});

const jobCardWorker = new Worker('generateJobCard', processGenerateJobCard, {
  connection,
  concurrency: JOB_CARD_WORKER_CONCURRENCY,
});

/* ---------- EVENT LOGGING ---------- */

function attachLogging(worker: Worker, name: string) {
  worker.on('active', (job) => {
    console.log(`🚀 [${name}] Job ${job.id} started`);
  });

  worker.on('completed', (job, result) => {
    console.log(`✅ [${name}] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ [${name}] Job ${job?.id} failed: ${err.message}`);
  });

  worker.on('error', (err) => {
    console.error(`🔥 [${name}] Worker error: ${err.message}`);
  });
}

attachLogging(fileWorker, 'file-processing');
attachLogging(jobCardWorker, 'generateJobCard');

console.log('📦 Workers started and waiting for jobs...');
