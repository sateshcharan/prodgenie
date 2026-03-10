import { randomUUID, UUID } from 'crypto';

import {
  supabaseAdmin,
  FileStorageService,
  FolderService,
} from '@prodgenie/libs/supabase';
import { prisma, workspaceRole } from '@prodgenie/libs/db';
import { StringService } from '@prodgenie/libs/shared-utils';

import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { workspaceMemberStatus } from '@prisma/client';
// import { workspaceRole } from '@prodgenie/libs/types';
// import { NotificationService } from './notification.service';

export class WorkspaceService {
  static async createWorkspace(
    workspaceName: string,
    planId: string,
    user: any
  ) {
    workspaceName = StringService.camelCase(workspaceName);

    const workspace = await prisma.$transaction(async (tx) => {
      const ws = await this.setupNewWorkspaceTx(
        tx,
        workspaceName,
        planId,
        user
      ); // setup new workspace and dependencies

      return ws;
    });
    await FolderService.scaffoldFolder(workspace.id); // setup workspace folders

    // add user as owner of workspace
    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'owner',
        status: 'active',
      },
    });

    // fetch updated workspaces for user
    const updatedWorkspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    return updatedWorkspaces;
  }

  static async deleteWorkspace(user: any, workspaceId: string) {
    const isOwner = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: user.id, role: 'owner' },
    });
    if (!isOwner) throw new Error('You are not the owner');

    await prisma.$transaction(async (tx) => {
      await this.deleteWorkspaceTx(tx, workspaceId);
    });

    // delete storage folders after DB commit
    try {
      await FolderService.deleteFolderRecursive(workspaceId);
    } catch (err) {
      console.error(
        `Failed to delete folder for workspace ${workspaceId}:`,
        err
      );
    }

    // fetch updated workspaces for user
    const updatedWorkspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    return updatedWorkspaces;
  }

  static async deleteAccount(userId: string) {
    // STEP 1 — run DB transaction only
    const workspaceIds = await prisma.$transaction(async (tx) => {
      const memberships = await tx.workspaceMember.findMany({
        where: { userId, role: 'owner' },
        select: { workspaceId: true },
      });

      const ids: string[] = [];

      for (const m of memberships) {
        await WorkspaceService.deleteWorkspaceTx(tx, m.workspaceId);
        ids.push(m.workspaceId);
      }

      await tx.user.delete({
        where: { id: userId },
      });

      return ids; // 👈 important
    });

    // STEP 2 — external side effects AFTER commit

    // delete storage folders
    for (const workspaceId of workspaceIds) {
      try {
        await FolderService.deleteFolderRecursive(workspaceId);
      } catch (err) {
        console.error(
          `Failed to delete folder for workspace ${workspaceId}:`,
          err
        );
      }
    }

    // delete Supabase auth user
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (err) {
      console.error('Failed to delete auth user:', err);
    }
  }

  static async setupNewWorkspaceTx(
    tx: any,
    workspaceName: string,
    planId: string,
    user?: any
  ) {
    const plan = await tx.plan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new Error('Plan not found');

    // Create workspace
    const workspace = await tx.workspace.create({
      data: {
        name: workspaceName,
        planId,
        credits: plan?.monthlyCredits,
      },
    });

    // Create workspace usage
    await tx.workspaceUsage.create({
      data: {
        workspaceId: workspace.id,
        periodStart: new Date(),
        periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });

    // // add user as owner of workspace
    // await tx.workspaceMember.create({
    //   data: {
    //     userId: user.id,
    //     workspaceId: workspace.id,
    //     role: workspaceRole.owner,
    //     status: workspaceMemberStatus.active,
    //   },
    // });

    return workspace;
  }

  static async deleteWorkspaceTx(tx: any, workspaceId: string) {
    // Delete workspace files
    await tx.file.deleteMany({
      where: { workspaceId },
    });

    // Delete workspace events
    await tx.event.deleteMany({
      where: { workspaceId },
    });

    // Delete usage records
    await tx.workspaceUsage.deleteMany({
      where: { workspaceId },
    });

    // Delete members
    await tx.workspaceMember.deleteMany({
      where: { workspaceId },
    });

    // Delete notifications (future)
    // await tx.notification.deleteMany({ where: { workspaceId } });

    // Finally delete workspace
    await tx.workspace.delete({
      where: { id: workspaceId },
    });
  }

  static async switchActiveWorkspace(workspaceId: string, userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { activeWorkspaceId: workspaceId },
    });
  }

  static async getWorkspaceEvents(workspaceId: string) {
    if (!workspaceId) throw new Error('workspaceId is required.');

    const events = await prisma.event.findMany({
      where: {
        workspaceId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return events;
  }

  static async getWorkspaceUsage(workspaceId: string) {
    return await prisma.workspaceUsage.findMany({
      where: {
        workspaceId,
      },
    });
  }

  static async getJobCardStats(workspaceId: string, days: number) {
    const events = await prisma.event.findMany({
      where: {
        workspaceId,
        type: 'jobcard_generation',
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        createdAt: true,
      },
    });

    const stats = events.reduce((acc, e) => {
      const day = e.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([date, count]) => ({
      date,
      count,
    }));
  }

  static async getTotalJobCards(workspaceId: string) {
    // return await prisma.event.count({
    //   where: {
    //     workspaceId,
    //     type: 'jobcard_generation',
    //     status: 'completed',
    //   },
    // });

    const counts = await prisma.workspaceUsage.findMany({
      where: {
        workspaceId,
      },
    });

    const total = counts.map((c) => c.jobCardsCount).reduce((a, b) => a + b, 0);

    return total;
  }

  static async getWorkspaceConfig(workspaceId: string, configName: string) {
    const config = await prisma.file.findFirst({
      where: {
        workspaceId,
        type: 'config',
        name: configName,
      },
    });
    if (!config) return null;

    // const signedUrl = await fileStorageService.getCachedSignedUrl(config?.path);
    // config.path = signedUrl;

    return config;
  }

  static async setWorkspaceConfig(
    workspaceId: string,
    configName: string,
    content: any
  ) {
    const config = await prisma.file.findFirst({
      where: {
        workspaceId,
        type: 'config',
        name: configName,
      },
    });

    if (!config) {
      throw new Error(
        `Config "${configName}" not found for workspace ${workspaceId}`
      );
    }

    const updatedConfig = await prisma.file.update({
      where: { id: config.id },
      data: {
        data: content,
      },
    });

    return {
      updatedConfig,
    };
  }

  static async checkWorkspaceExists(workspaceName: string) {
    const workspace = await prisma.workspace.findFirst({
      where: { name: workspaceName },
    });

    return workspace ? true : false;
  }

  static async updateWorkspaceConfig(
    workspaceId: string,
    configName: string,
    content: any
  ) {
    const config = await prisma.file.findFirst({
      where: {
        workspaceId,
        type: 'config',
        name: configName,
      },
      select: { data: true, id: true },
    });

    if (!config) {
      throw new Error(
        `Config "${configName}" not found for workspace ${workspaceId}`
      );
    }

    const updatedConfig = {
      ...config.data,
      ...content,
    };

    return await prisma.file.update({
      where: { id: config.id },
      data: { data: updatedConfig },
    });
  }

  // === future features ===
  // static async removeUserFromWorkspace(workspaceId: string, userId: string) {
  //   await prisma.$transaction(async (tx) => {
  //     await tx.workspaceMember.delete({
  //       where: {
  //         userId_workspaceId: {
  //           workspaceId,
  //           userId,
  //         },
  //       },
  //     });
  //   });

  //   // await NotificationService.createNotification(
  //   //   userId,
  //   //   workspaceId,
  //   //   'removed',
  //   //   { workspaceId }
  //   // );
  // }

  // static async getWorkspaceUsers(workspaceId: string) {
  //   if (!workspaceId) throw new Error('workspaceId is required.');

  //   const users = await prisma.workspaceMember.findMany({
  //     where: {
  //       workspaceId,
  //       // isDeleted: false,
  //     },
  //     include: { user: true },
  //   });

  //   return users;
  // }

  // static async getWorkspaceTransactions(workspaceId: string) {
  //   const transactions = await prisma.transaction.findMany({
  //     where: {
  //       workspaceId,
  //     },
  //   });
  //   return transactions;
  // }

  // static async updateUserRole(
  //   workspaceId: string,
  //   userId: string,
  //   role: workspaceRole
  // ) {
  //   await prisma.workspaceMember.update({
  //     where: {
  //       userId_workspaceId: {
  //         workspaceId,
  //         userId,
  //       },
  //     },
  //     data: { role: role },
  //   });

  //   await NotificationService.createNotification(
  //     userId,
  //     workspaceId,
  //     'role_changed',
  //     { role }
  //   );
  // }

  // static acceptInvite = async (workspaceId: string, userId: string) => {
  //   return prisma.workspaceMember.update({
  //     where: { userId_workspaceId: { userId, workspaceId } },
  //     data: { status: 'active' }, // depends on your membership model
  //   });
  // };

  // static rejectInvite = async (workspaceId: string, userId: string) => {
  //   return prisma.workspaceMember.delete({
  //     where: { userId_workspaceId: { userId, workspaceId } },
  //   });
  // };

  // //helper methods
  // static async addUserToWorkspace(workspaceId: string, userId: string) {
  //   await prisma.workspaceMember.create({
  //     data: {
  //       workspaceId,
  //       userId,
  //       role: 'member',
  //     },
  //   });
  // }

  // static async inviteUserToWorkspace(
  //   workspaceId: string,
  //   email: string,
  //   role: workspaceRole
  // ) {
  //   return prisma.$transaction(async (tx) => {
  //     // Check if user exists in DB
  //     let user = await tx.user.findUnique({
  //       where: { email },
  //     });

  //     // If not exist, signupNewUser
  //     if (!user) {
  //       user = await AuthService.inviteUserViaEmail(email);
  //     }

  //     // Create workspace membership with status pending
  //     const workspaceMember = await tx.workspaceMember.upsert({
  //       where: {
  //         userId_workspaceId: {
  //           userId: user.id,
  //           workspaceId,
  //         },
  //       },
  //       update: {
  //         role,
  //         status: 'pending',
  //       },
  //       create: {
  //         userId: user.id,
  //         workspaceId,
  //         role,
  //         status: 'pending',
  //       },
  //     });

  //     // Send invite notification
  //     await NotificationService.createNotification(
  //       user.id,
  //       workspaceId,
  //       'invite',
  //       { workspaceId, role }
  //     );

  //     return workspaceMember;
  //   });
  // }
}
