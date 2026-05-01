import { Request, Response } from 'express';

import { AdminService } from '../services/admin.service';

export class AdminController {
  static async getEventDetails(req: Request, res: Response) {
    const { eventId } = req.params;

    const data = await AdminService.getEventDetails(eventId);
    return res.status(200).json({ data });
  }

  static async approveEvent(req: Request, res: Response) {
    const { eventId, remark } = req.body;

    const data = await AdminService.approveEvent(eventId);
    return res.status(200).json({ data });
  }

  static async rejectEvent(req: Request, res: Response) {
    const { eventId, remark } = req.body;

    const data = await AdminService.rejectEvent(eventId, remark);
    return res.status(200).json({ data });
  }
}
