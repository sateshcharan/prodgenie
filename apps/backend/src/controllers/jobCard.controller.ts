import { Request, Response } from 'express';

import { JobCardService } from '../services/index.js';

const jobCardService = new JobCardService();

export class JobCardController {
  static async generateJobCard(req: Request, res: Response) {
    const user = req.user;
    const activeWorkspaceId = req.activeWorkspaceId!;

    const activeWorkspace = user?.memberships?.find(
      (m) => m.workspace.id === activeWorkspaceId
    );
    const jobCardUrl = await jobCardService.generateJobCard({
      user,
      bom: req.body.bom,
      titleBlock: req.body.titleBlock,
      printingDetails: req.body.printingDetails,
      jobCardForm: req.body.jobCardForm,
      signedUrl: req.body.signedUrl,
      activeWorkspace: activeWorkspace,
    });
    res.status(201).json({ success: true, url: jobCardUrl });
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
