import { Request, Response } from 'express';

import { JobCardService } from '../services/index.js';

const jobCardService = new JobCardService();

export class JobCardController {
  static async generateJobCard(req: Request, res: Response) {
    const jobCardUrl = await jobCardService.generateJobCard({
      user: req.user,
      bom: req.body.bom,
      titleBlock: req.body.titleBlock,
      printingDetails: req.body.printingDetails,
      jobCardForm: req.body.jobCardForm,
      signedUrl: req.body.signedUrl,
    });
    res.status(201).json({ success: true, url: jobCardUrl });
  }

  static async getJobCardNumber(req: Request, res: Response) {
    const org = req?.user?.org;
    const { data } = await jobCardService.getJobCardNumber(org);
    res.status(200).json({ success: true, data: data });
  }
}
