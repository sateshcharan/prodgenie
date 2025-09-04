import { prisma } from '@prodgenie/libs/prisma';
// import { supabase } from '@prodgenie/libs/supabase';
// import { WorkspaceRole } from '@prodgenie/libs/types';

export class UserService {
  async createUser(user: {
    id: string;
    email: string;
    password: string;
    name?: string;
  }) {
    return await prisma.user.create({
      data: user,
    });
  }

  async deleteUser(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async getProfile(userId: string) {
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
}
