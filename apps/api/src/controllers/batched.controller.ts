import { Request, Response } from 'express';

import { WorkspaceService, UserService } from '../services';

export class BatchedController {
  static async init(req: Request, res: Response) {
    const user = req.user;
    const userId = user?.id;
    const activeWorkspaceId = user.activeWorkspaceId; // from user preference in db

    const [profile, workspaceUsers, workspaceEvents] = await Promise.all([
      UserService.getProfile(userId),
      WorkspaceService.getWorkspaceUser(activeWorkspaceId),
      WorkspaceService.getWorkspaceEvents(activeWorkspaceId),
    ]);

    return res.json({
      user,
      profile,
      workspaceUsers,
      workspaceEvents,
    });
  }

  static async workspaceChange(req: Request, res: Response) {
    const { workspaceId } = req.query;
    const [workspaceUsers, workspaceEvents] = await Promise.all([
      WorkspaceService.getWorkspaceUser(workspaceId),
      WorkspaceService.getWorkspaceEvents(workspaceId),
    ]);
    return res.json({
      workspaceUsers,
      workspaceEvents,
    });
  }
}
