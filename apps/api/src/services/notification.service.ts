import { notificationType } from '@prisma/client';

import { prisma } from '@prodgenie/libs/db';

export class NotificationService {
  static getUserNotifications = async (userId: string) => {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  };

  static markAsRead = async (id: string) => {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  };

  static createNotification = async (
    userId: string,
    workspaceId: string,
    type: notificationType,
    data: any
  ) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    // construct message
    const message =
      type === notificationType.role_changed
        ? `your role has been update to ${data.role} in ${workspace?.name} workspace.`
        : type === notificationType.removed
        ? `you have been removed from ${workspace?.name} workspace.`
        : type === notificationType.invite
        ? `you have been invited to ${workspace?.name} workspace as ${data.role}.`
        : '';

    return prisma.notification.create({
      data: {
        userId,
        workspaceId,
        type,
        message,
      },
    });
  };

  // static markWorkspaceInviteAsHandled = async (
  //   workspaceId: string,
  //   userId: string
  // ) => {
  //   return prisma.notification.updateMany({
  //     where: { userId, workspaceId, type: 'INVITE' },
  //     data: { read: true },
  //   });
  // };
}
