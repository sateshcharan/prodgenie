import { prisma } from '@prodgenie/libs/db';
import { FolderService } from '@prodgenie/libs/supabase';
import { WorkspaceService } from './workspace.service';
import { StringService } from '@prodgenie/libs/shared-utils';

export class UserService {
  static async createUser(user: {
    id: string;
    email: string;
    password: string;
    name?: string;
  }) {
    return await prisma.user.create({
      data: user,
    });
  }

  static async getProfile(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            workspace: {
              include: {
                plan: true,
              },
            },
          },
          where: {
            status: 'active',
          },
        },
      },
    });
  }

  async updateProfile(userId: string, updates: Record<string, any>) {
    return await prisma.user.update({
      where: { id: userId },
      data: updates,
    });
  }

  static async deleteUser(userId: string) {
    return await prisma.user.delete({
      where: { id: userId },
    });
  }

  static async setupNewUserTx(
    tx: any,
    supabaseUserId: string,
    email: string,
    name?: string
  ) {
    if (!name) name = StringService.camelCase(email.split('@')[0]);

    // ✅ use tx and null-check
    const freePlan = await tx.plan.findFirst({
      where: { name: 'free' },
      select: { id: true },
    });

    if (!freePlan) {
      throw new Error('Free plan not found. Seed plans first.');
    }

    const freePlanId = freePlan.id;

    // Create workspace
    const workspace = await WorkspaceService.setupNewWorkspaceTx(
      tx,
      name,
      freePlanId,
      { id: supabaseUserId }
    );

    // Create or update user in DB
    await tx.user.upsert({
      where: { id: supabaseUserId },
      update: {
        name,
        email,
        activeWorkspaceId: workspace.id,
      },
      create: {
        id: supabaseUserId,
        name,
        email,
        activeWorkspaceId: workspace.id,
      },
    });

    // Add user as workspace member
    await tx.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: supabaseUserId,
          workspaceId: workspace.id,
        },
      },
      update: { role: 'owner', status: 'active' },
      create: {
        userId: supabaseUserId,
        workspaceId: workspace.id,
        role: 'owner',
        status: 'active',
      },
    });

    // ❌ DO NOT scaffold here

    return workspace;
  }
}
