import { prisma } from '@prodgenie/libs/prisma';
import { WorkspaceRole } from '@prodgenie/libs/types';
import { FileStorageService, supabase } from '@prodgenie/libs/supabase';

import { FolderService } from './folder.service';

const folderService = new FolderService();
const fileStorageService = new FileStorageService();

export class WorkspaceService {
  static async createWorkspace(
    workspaceName: string,
    planId: string,
    user: any
  ) {
    // Create workspace
    const workspaceFolder = await folderService.scaffoldFolder(
      workspaceName,
      planId
    );

    // Create workspace in DB
    const workspaceDb = await prisma.workspace.create({
      data: {
        name: workspaceName,
        planId,
      },
    });

    // Create workspace membership
    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspaceDb.id,
        role: 'OWNER',
      },
    });

    return workspaceDb;
  }

  static async deleteWorkspace(workspaceId: string) {
    // delete all workspace members
    await prisma.workspaceMember.updateMany({
      where: { workspaceId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    // delete all workspace files
    const { data: files } = await supabase.storage
      .from('workspace-files')
      .list(`${workspaceId}/`);
    if (files) {
      const paths = files.map((f) => `${workspaceId}/${f.name}`);
      await supabase.storage.from('workspace-files').remove(paths);
    }

    // delete all workspace activity
    await prisma.workspaceActivity.updateMany({
      where: { workspaceId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    // delete workspace
    await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  static async inviteUserToWorkspace(
    workspaceId: string,
    email: string,
    role: WorkspaceRole
  ) {
    // 1. Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. If not exist, create a placeholder user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
        },
      });

      // Also create in Supabase Auth (optional but recommended)
      try {
        const { data: invited, error } =
          await supabase.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${process.env.BACKEND_URL}/auth/callback`,
          });

        if (error) {
          console.error('Supabase invite error:', error.message);
        } else {
          console.log('Supabase invite sent:', invited);
        }
      } catch (err) {
        console.error('Supabase invite exception:', err);
      }
    }

    // 3. Create workspace membership with status pending
    const workspaceMember = await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
      update: {
        role,
        isDeleted: false,
        deletedAt: null,
        status: 'PENDING',
      },
      create: {
        userId: user.id,
        workspaceId,
        role,
        status: 'PENDING',
      },
    });

    // 4. Optionally also send your own branded invite email
    // await EmailService.sendInvite(email, {
    //   workspaceId,
    //   role,
    //   link: `${process.env.FRONTEND_URL}/invite/accept?workspaceId=${workspaceId}`,
    // });

    return workspaceMember;
  }

  static async removeUserFromWorkspace(workspaceId: string, userId: string) {
    await prisma.workspaceMember.update({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId,
        },
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  static async getWorkspaceUser(workspaceId: string) {
    if (!workspaceId) return [];
    const users = await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        isDeleted: false,
      },
      include: { user: true },
    });
    return users;
  }

  static async getWorkspaceActivity(workspaceId: string) {
    const activity = await prisma.activity.findMany({
      where: {
        workspaceId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return activity;
  }

  static async getWorkspaceTransactions(workspaceId: string) {
    const transactions = await prisma.transaction.findMany({
      where: {
        workspaceId,
      },
    });
    return transactions;
  }

  static async checkWorkspaceExists(workspaceName: string) {
    const workspace = await prisma.workspace.findFirst({
      where: { name: workspaceName },
    });

    return workspace ? true : false;
  }

  async getWorkspaceConfig(workspaceId: string, configName: string) {
    const config = await prisma.file.findFirst({
      where: {
        workspaceId,
        type: 'config',
        name: configName,
      },
    });
    if (!config) return null;

    // const signedUrl = await fileStorageService.getSignedUrl(config?.path);
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

  static async updateUserRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole
  ) {
    await prisma.workspaceMember.update({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId,
        },
      },
      data: { role: role },
    });
  }

  //helper methods
  static async addUserToWorkspace(workspaceId: string, userId: string) {
    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role: 'MEMBER',
      },
    });
  }
}
