import { Request, Response } from 'express';

import { UserService } from '../services/user.service';
import { WorkspaceService } from '../services/workspace.service';
import { NotificationService } from '../services/notification.service';

export class BatchedController {
  static async init(req: Request, res: Response) {
    const user = req.user;
    // const userId = user?.id;
    const activeWorkspaceId = user.activeWorkspaceId; // from user preference in db

    // const [profile, workspaceUsers, workspaceEvents] = await Promise.all([
    const [
      // notifications,
      // workspaceUsers,
      workspaceUsage,
      workspaceEvents,
      jobCardStats,
      // totalJobCards,
    ] = await Promise.all([
      WorkspaceService.getWorkspaceUsage(activeWorkspaceId),
      WorkspaceService.getWorkspaceEvents(activeWorkspaceId),
      WorkspaceService.getJobCardStats(activeWorkspaceId, 7),
      // WorkspaceService.getTotalJobCards(activeWorkspaceId),

      // === future feature ===
      // UserService.getProfile(userId),
      // NotificationService.getUserNotifications(user.id),
      // WorkspaceService.getWorkspaceUsers(activeWorkspaceId),
    ]);

    return res.json({
      user,
      workspaceEvents,
      workspaceUsage,
      jobCardStats,
      // totalJobCards,

      // == future feature ===
      // profile,
      // notifications,
      // workspaceUsers,
    });
  }

  static async workspaceChange(req: Request, res: Response) {
    const user = req.user;
    const { workspaceId } = req.query;
    // const [workspaceUsers, workspaceEvents] = await Promise.all([
    const [workspaceEvents] = await Promise.all([
      WorkspaceService.getWorkspaceEvents(workspaceId),
      WorkspaceService.switchActiveWorkspace(workspaceId, user.id),
      // WorkspaceService.getWorkspaceUsers(workspaceId),
    ]);
    return res.json({
      // workspaceUsers,
      workspaceEvents,
    });
  }
}
