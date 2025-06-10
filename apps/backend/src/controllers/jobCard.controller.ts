import { Request, Response } from 'express';

import { JobCardService } from '../services/index.js';

const jobCardService = new JobCardService();

export class JobCardController {
  static async generateJobCard(req: Request, res: Response) {
    try {
      const jobCardUrl = await jobCardService.generateJobCard({
        user: req.user,
        bom: req.body.bom,
        titleBlock: req.body.titleBlock,
        printingDetails: req.body.printingDetails,
        jobCardForm: {
          ...req.body.jobCardForm,
          jobCardDate: new Date().toISOString().split('T')[0],
        },
        signedUrl: req.body.signedUrl,
      });
      res.status(201).json({ success: true, url: jobCardUrl });
    } catch (error: any) {
      console.error('Error generating job card:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getJobCardNumber(req: Request, res: Response) {
    const org = req?.user?.org;
    try {
      const { data } = await jobCardService.getJobCardNumber(org);
      res.status(200).json({ success: true, data: data });
    } catch (error: any) {
      console.error('Error generating job card:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
