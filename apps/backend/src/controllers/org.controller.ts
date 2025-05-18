import { Request, Response } from 'express';

import { OrgService } from '../services/index.js';

export class OrgController {
  static async checkOrgExists(req: Request, res: Response) {
    const { orgName } = req.query;
    try {
      const orgExists = await OrgService.checkOrgExists(orgName as string);
      res.status(201).json({ success: true, data: orgExists });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getOrgUsers(req: Request, res: Response) {
    const { orgId } = req.params;
    try {
      const users = await OrgService.getOrgUser(orgId);
      res.status(201).json({ success: true, data: users });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
