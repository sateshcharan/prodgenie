import { Request, Response } from 'express';

import { WorkspaceService, UserService } from '../services';

export class BatchedController {
  static async init(req: Request, res: Response) {
    const user = req.user;
    const userId = user?.id;
    const activeWorkspaceId = req.activeWorkspaceId;

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
}
