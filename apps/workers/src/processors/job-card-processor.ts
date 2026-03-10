import { Job } from 'bullmq';

// import { EventService } from '@prodgenie/libs/db';
import { JobCardService } from '@prodgenie/libs/server-services/lib/jobCard.service';

// const jobCardService = new JobCardService();
// const eventService = new EventService();

export const processGenerateJobCard = async (job: Job) => {
  const { jobId, jobCardGenerationData } = job.data;
  console.log('📦 Processing generateJobCard', jobId);

  try {
    const jobCardUrl = await JobCardService.generateJobCard(
      jobCardGenerationData,
      jobId
    );

    // Step 2. Update Event Record
    // console.log(`✅ Job ${jobId} completed, job card: ${jobCardUrl}`);
    return jobCardUrl;
  } catch (err: any) {
    console.error(`❌ Job ${jobId} failed: ${err.message}`);
    throw err;
  }
};
