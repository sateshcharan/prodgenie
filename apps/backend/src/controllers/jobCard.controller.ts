import { Request, Response } from 'express';
import { JobCardService } from '../services/jobCard.service';

export class JobCardController {
  private static jobCardService = new JobCardService();

  static async generateJobCard(req: Request, res: Response) {
    const user = req.user;

    try {
      await JobCardController.jobCardService.generateJobCard({
        ...req.body,
        user,
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
