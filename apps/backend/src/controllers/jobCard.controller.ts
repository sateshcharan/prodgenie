import { Request, Response } from 'express';
import { JobCardService } from '../services/jobCard.service';

export class JobCardController {
  static async generateJobCard(req: Request, res: Response) {
    try {
      const tables = await JobCardService.generateJobCard(req.body);
      res.status(201).json({ success: true, data: tables });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
