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
