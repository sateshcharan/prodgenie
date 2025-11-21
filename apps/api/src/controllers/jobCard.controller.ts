import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

import { EventService } from '@prodgenie/libs/db';
import { jobCardQueue } from '@prodgenie/libs/queues';
import { EventStatus, EventType } from '@prisma/client';
// import { JobCardService } from '@prodgenie/libs/server-services';

import { JobCardService } from '../services';

const jobCardService = new JobCardService();
export class JobCardController {
  static async generateJobCard(req: Request, res: Response) {
    const user = req.user;
    const activeWorkspaceId = req.activeWorkspaceId!;

    const activeWorkspace = user?.memberships?.find(
      (m) => m.workspace.id === activeWorkspaceId
    );

    const jobCardGenerationData = {
      user,
      bom: req.body.bom,
      titleBlock: req.body.titleBlock,
      printingDetails: req.body.printingDetails,
      jobCardForm: req.body.jobCardForm,
      signedUrl: req.body.signedUrl,
      activeWorkspace: activeWorkspace,
    };

    // // directly generate job card and return url
    // const jobCardUrl = await jobCardService.generateJobCard(
    //   jobCardGenerationData
    // );
    // res.status(201).json({ success: true, url: jobCardUrl });

    // add file to processing queue for job card generation
    const jobId = randomUUID();

    await EventService.record({
      id: jobId,
      userId: user?.id,
      workspaceId: activeWorkspaceId,
      type: EventType.JOBCARD_GENERATION,
      status: EventStatus.PENDING,
    });

    await jobCardQueue.add('generateJobCard', {
      jobCardGenerationData: jobCardGenerationData,
      jobId: jobId,
    });

    res.status(201).json({
      success: true,
      message:
        'Job card generation started, you can watch the progress in the dashboard',
    });
  }

  static async getJobCardNumber(req: Request, res: Response) {
    const user = req.user;
    const activeWorkspaceId = req.activeWorkspaceId!;
    const activeWorkspace = user.memberships.find(
      (m) => m.workspace.id === activeWorkspaceId
    );
    
    const { data } = await jobCardService.getJobCardNumber(activeWorkspace);
    res.status(200).json({ success: true, data: data });
  }
}
