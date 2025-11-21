import { Request, Response } from 'express';

import { NotificationService, WorkspaceService } from '../services';

export class NotificationController {
  static getUserNotifications = async (req: Request, res: Response) => {
    const user = req.user!;

    const notifications = await NotificationService.getUserNotifications(
      user.id
    );
    return res.status(200).json({ success: true, data: notifications });
  };

  static markAsRead = async (req: Request, res: Response) => {
    const { id } = req.params;

    await NotificationService.markAsRead(id);
    return res.status(200).json({ success: true });
  };

  // static acceptInvite = async (req: Request, res: Response) => {
  //   const user = req.user!;
  //   const { workspaceId } = req.params;

  //   await WorkspaceService.acceptInvite(workspaceId, user.id);
  //   await NotificationService.markWorkspaceInviteAsHandled(
  //     workspaceId,
  //     user.id
  //   );

  //   return res.status(200).json({ success: true, message: 'Invite accepted' });
  // };

  // static rejectInvite = async (req: Request, res: Response) => {
  //   const user = req.user!;
  //   const { workspaceId } = req.params;

  //   await WorkspaceService.rejectInvite(workspaceId, user.id);
  //   await NotificationService.markWorkspaceInviteAsHandled(
  //     workspaceId,
  //     user.id
  //   );

  //   return res.status(200).json({ success: true, message: 'Invite rejected' });
  // };
}
