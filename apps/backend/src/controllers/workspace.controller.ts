import { Request, Response } from 'express';

import { FolderService } from '../services/index.js';
import { WorkspaceService } from '../services/index.js';

export class WorkspaceController {
  static createWorkspace = async (req: Request, res: Response) => {
    const { workspaceName, planId } = req.body;
    const user = req.user;

    const result = await WorkspaceService.createWorkspace(
      workspaceName,
      planId,
      user
    );

    return res.status(200).json({ success: true, data: 'Workspace created' });
  };

  static deleteWorkspace = async (req: Request, res: Response) => {
    const { workspaceId } = req.body;
    const user = req.user;

    //else remove all workspace members, delete all folders and files, delete workspacce history , delete workspace
  };

  static inviteUserToWorkspace = async (req: Request, res: Response) => {
    const { workspaceId, email, role } = req.body;

    const invitedUser = await WorkspaceService.inviteUserToWorkspace(
      workspaceId,
      email,
      role
    );
    return res.status(200).json({ success: true, data: invitedUser });
  };

  static removeUserFromWorkspace = async (req: Request, res: Response) => {
    const { workspaceId, userId } = req.body;

    const removedUser = await WorkspaceService.removeUserFromWorkspace(
      workspaceId,
      userId
    );

    return res.status(200).json({ success: true, data: removedUser });
  };

  static getWorkspaceUsers = async (req: Request, res: Response) => {
    const { workspaceId } = req.query;

    const users = await WorkspaceService.getWorkspaceUser(
      workspaceId as string
    );
    return res.status(200).json({ success: true, data: users });
  };

  static getWorkspaceActivity = async (req: Request, res: Response) => {
    const workspaceId = req.activeWorkspaceId;
    const activity = await WorkspaceService.getWorkspaceActivity(workspaceId);
    return res.status(200).json({ success: true, data: activity });
  };

  static getWorkspaceTransactions = async (req: Request, res: Response) => {
    const workspaceId = req.activeWorkspaceId;
    const transactions = await WorkspaceService.getWorkspaceTransactions(
      workspaceId
    );
    return res.status(200).json({ success: true, data: transactions });
  };

  static checkWorkspaceExists = async (req: Request, res: Response) => {
    const { workspaceName } = req.query;
    const exists = await WorkspaceService.checkWorkspaceExists(
      workspaceName as string
    );
    return res.status(200).json({ success: true, data: exists });
  };

  static updateUserRoleInWorkspace = async (req: Request, res: Response) => {
    const { workspaceId, userId, role } = req.body;
    const updatedUser = await WorkspaceService.updateUserRole(
      workspaceId,
      userId,
      role
    );
    return res.status(200).json({ success: true, data: updatedUser });
  };

  static getWorkspaceConfig = async (req: Request, res: Response) => {
    const activeWorkspaceId = req.activeWorkspaceId!;

    const config = await WorkspaceService.getWorkspaceConfig(
      activeWorkspaceId as string,
      req.params.configName
    );
    if (!config) {
      return res
        .status(404)
        .json({ success: false, message: 'Config not found' });
    }

    return res.status(200).json({ success: true, data: config });
  };

  static setWorkspaceConfig = async (req: Request, res: Response) => {
    const activeWorkspaceId = req.activeWorkspaceId!;
    const configName = req.params.configName;

    try {
      const config = await WorkspaceService.setWorkspaceConfig(
        activeWorkspaceId,
        configName,
        req.body
      );

      return res.status(200).json({ success: true, data: config });
    } catch (err) {
      console.error('Failed to update config', err);
      return res
        .status(500)
        .json({ success: false, message: 'Failed to update config' });
    }
  };
}
