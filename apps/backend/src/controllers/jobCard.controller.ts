import { Request, Response } from 'express';

import { JobCardService } from '../services/index.js';

const jobCardService = new JobCardService();

export class JobCardController {
  static async generateJobCard(req: Request, res: Response) {
    try {
      await jobCardService.generateJobCard({
        user: req.user,
        file: req.body.file,
        bom: req.body.bom,
        titleBlock: req.body.titleBlock,
        jobCardForm: req.body.jobCardForm,
      });
      res
        .status(201)
        .json({ success: true, message: 'Job card generation started' });
    } catch (error: any) {
      console.error('Error generating job card:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
