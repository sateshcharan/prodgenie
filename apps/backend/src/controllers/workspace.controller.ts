import { Request, Response } from 'express';
import { WorkspaceService } from '../services/index.js';

import { FolderService } from '../services/index.js';

const folderService = new FolderService();

export class WorkspaceController {
  static checkWorkspaceExists = async (req: Request, res: Response) => {
    const { workspaceName } = req.query;
    const exists = await WorkspaceService.checkWorkspaceExists(
      workspaceName as string
    );
    return res.status(200).json({ success: true, data: exists });
  };

  static getWorkspaceUsers = async (req: Request, res: Response) => {
    const { workspaceId } = req.query;
    const users = await WorkspaceService.getWorkspaceUser(
      workspaceId as string
    );
    return res.status(200).json({ success: true, data: users });
  };

  static getWorkspaceConfig = async (req: Request, res: Response) => {
    const { workspaceId } = req.query;

    const config = await WorkspaceService.getWorkspaceConfig(
      workspaceId as string,
      req.params.configName
    );
    if (!config) {
      return res
        .status(404)
        .json({ success: false, message: 'Config not found' });
    }

    return res.status(200).json({ success: true, data: config });
  };

  static getWorkspaceHistory = async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const history = await WorkspaceService.getWorkspaceHistory(workspaceId);
    return res.status(200).json({ success: true, data: history });
  };

  static createNewWorkspace = async (req: Request, res: Response) => {
    const { workspaceName, planId } = req.body;
    const user = req.user;
    //scaffold folder and create workspace in db
    const workspace = await folderService.scaffoldFolder(workspaceName, planId);

    //add current user to workspacemember
    const addCurrentUser = await WorkspaceService.addUserToWorkspace(
      workspace.id,
      user.id
    );
    return res.status(200).json({ success: true, data: 'Workspace created' });
  };
}
