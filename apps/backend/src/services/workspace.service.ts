import { prisma } from '@prodgenie/libs/prisma';
import { FileStorageService } from '@prodgenie/libs/supabase';

const fileStorageService = new FileStorageService();
export class WorkspaceService {
  static async checkWorkspaceExists(workspaceName: string) {
    const workspace = await prisma.workspace.findFirst({
      where: { name: workspaceName },
    });

    return workspace ? true : false;
  }

  static async getWorkspaceUser(workspaceId: string) {
    if (!workspaceId) return [];
    const users = await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: { user: true },
    });
    return users;
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
    const signedUrl = await fileStorageService.getSignedUrl(config?.path);
    config.path = signedUrl;
    return config;
  }

  static async getWorkspaceHistory(workspaceId: string) {
    const history = await prisma.history.findMany({
      where: {
        workspaceId,
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
    return history;
  }

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
