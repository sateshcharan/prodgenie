import { prisma } from '@prodgenie/libs/prisma';

export class HistoryService {
  static async record(params: {
    userId: string;
    workspaceId: string;
    action: string;
    details?: string;
    jobId?: string | null;
    status?: string;
  }) {
    const recordsPerOrg = 50;
    return prisma.$transaction(async (tx) => {
      const count = await tx.history.count({
        where: { workspaceId: params.workspaceId },
      });

      if (count >= recordsPerOrg) {
        const oldest = await tx.history.findFirst({
          where: { workspaceId: params.workspaceId },
          orderBy: { createdAt: 'asc' },
          select: { id: true },
        });

        if (oldest) {
          await tx.history.delete({
            where: { id: oldest.id },
          });
        }
      }

      return tx.history.create({
        data: {
          userId: params.userId,
          workspaceId: params.workspaceId,
          action: params.action,
          details: params.details ?? null,
          jobId: params.jobId ?? null,
        },
      });
    });
  }

  static async getOrgHistory(workspaceId: string) {
    return prisma.history.findMany({
      where: { workspaceId: workspaceId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
