import { Worker } from 'bullmq';
import express from 'express';
import { redis } from '@prodgenie/libs/redis';

import { processDrawingBom } from './processors/file-processor.js';
import { processGenerateJobCard } from './processors/job-card-processor.js';

/* -------------------- Worker Config -------------------- */
const FILE_WORKER_CONCURRENCY = Number(
  process.env.FILE_WORKER_CONCURRENCY ?? 1
);
const JOB_CARD_WORKER_CONCURRENCY = Number(
  process.env.JOB_CARD_WORKER_CONCURRENCY ?? 1
);

/* -------------------- Workers -------------------- */
const fileWorker = new Worker('file-processing', processDrawingBom, {
  connection: redis,
  concurrency: FILE_WORKER_CONCURRENCY,
  autorun: false,
});

const jobCardWorker = new Worker('generateJobCard', processGenerateJobCard, {
  connection: redis,
  concurrency: JOB_CARD_WORKER_CONCURRENCY,
  autorun: false,
});

/* -------------------- Worker Logging -------------------- */
function attachLogging(worker: Worker, name: string) {
  worker.on('active', (job) => {
    console.log(`🚀 [${name}] Job ${job.id} started`);
  });

  worker.on('completed', (job) => {
    console.log(`✅ [${name}] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ [${name}] Job ${job?.id} FAILED`);
    console.error(err); // full stack
  });

  worker.on('error', (err) => {
    console.error(`🔥 [${name}] Worker error`);
    console.error(err);
  });
}

attachLogging(fileWorker, 'file-processing');
attachLogging(jobCardWorker, 'generateJobCard');

// Start workers explicitly (autorun:false)
fileWorker.run();
jobCardWorker.run();

console.log('📦 Workers started and waiting for jobs...');

/* -------------------- Graceful Shutdown -------------------- */
process.on('SIGTERM', async () => {
  console.log('⛔ Worker shutting down...');
  await fileWorker.close();
  await jobCardWorker.close();
  process.exit(0);
});

/* -------------------- Express Keep-Alive Server -------------------- */
const app = express();
const PORT = Number(process.env.WORKER_PORT || 3005);

// Status endpoint
// app.get('/status', async (req, res) => {
//   const fileStats = await fileWorker.getQueue().getJobCounts();
//   const jobCardStats = await jobCardWorker.getQueue().getJobCounts();

//   res.json({
//     fileProcessing: fileStats,
//     jobCard: jobCardStats,
//   });
// });

// Wakeup endpoint (manual or automated)
app.get('/wakeup', (_req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`🌐 Worker HTTP server listening on port ${PORT}`);
});
