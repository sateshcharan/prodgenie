import { Request, Response } from 'express';

import { ProjectWideService } from '../services/projectWide.service';

export class ProjectWideController {
  static async getPlans(req: Request, res: Response) {
    const plans = await ProjectWideService.getPlans();

    res.status(201).json({ success: true, data: plans });
  }
}
