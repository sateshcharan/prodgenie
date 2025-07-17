import { Request, Response } from 'express';
import { OrgService } from '../services/index.js';

export class OrgController {
  static checkOrgExists = async (req: Request, res: Response) => {
    const { orgName } = req.query;
    const exists = await OrgService.checkOrgExists(orgName as string);
    return res.status(200).json({ success: true, data: exists });
  };

  static getOrgUsers = async (req: Request, res: Response) => {
    const { orgId } = req.query;
    const users = await OrgService.getOrgUser(orgId as string);
    return res.status(200).json({ success: true, data: users });
  };

  static getOrgConfig = async (req: Request, res: Response) => {
    const { orgId } = req.query;

    const config = await OrgService.getOrgConfig(
      orgId as string,
      req.params.configName
    );
    if (!config) {
      return res
        .status(404)
        .json({ success: false, message: 'Config not found' });
    }

    return res.status(200).json({ success: true, data: config });
  };

  static getOrgHistory = async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const history = await OrgService.getOrgHistory(orgId);
    return res.status(200).json({ success: true, data: history });
  };
}
