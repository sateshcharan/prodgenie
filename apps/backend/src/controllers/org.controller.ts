import { Request, Response } from 'express';
import { OrgService } from '../services/org.service';

export class OrgController {
  static async checkOrgExists(req: Request, res: Response) {
    const { orgName } = req.query;
    console.log(orgName)
    try {
      const orgExists = await OrgService.checkOrgExists(orgName as string);
      res.status(201).json({ success: true, data: orgExists });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
