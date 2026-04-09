import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

import { JobCardService } from '@prodgenie/libs/server-services/lib/jobCard.service';

export class JobCardController {
  static async generateJobCard(req: Request, res: Response) {
    const user = req.user;
    const activeWorkspaceId = req.activeWorkspaceId!;

    const result = await JobCardService.enqueueJobCardGeneration({
      user,
      activeWorkspaceId,
      bom: req.body.bom,
      titleBlock: req.body.titleBlock,
      printingDetails: req.body.printingDetails,
      jobCardForm: req.body.jobCardForm,
      signedUrl: req.body.signedUrl,
      description: req.body.jobCardForm.global.jobCardNumber,
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

    const { data } = await JobCardService.getJobCardNumber(activeWorkspace);
    res.status(200).json({ success: true, data: data });
  }

  static async aiFillJobCard(req: Request, res: Response) {
    const { fileId } = req.body;
    const filledData = await JobCardService.aiFillJobCard(fileId);
    res.status(200).json({ success: true, data: filledData });
  }
}
