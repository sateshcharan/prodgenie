import { prisma } from '@prodgenie/libs/prisma';

export class UserService {
  async getProfile(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }

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

  async updateProfile(userId: string, updates: Record<string, any>) {
    return await prisma.user.update({
      where: { id: userId },
      data: updates,
    });
  }

  async listUsers(orgId: string) {
    return await prisma.user.findMany({
      where: {
        org: {
          id: orgId,
        },
      },
      include: {
        org: true,
      },
    });
  }

  async deleteUser(userId: string) {
    return await prisma.user.delete({
      where: { id: userId },
    });
  }
}
