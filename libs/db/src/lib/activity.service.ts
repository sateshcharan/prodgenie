import { prisma } from '@prodgenie/libs/prisma';

// import { ActivityType } from '@prodgenie/libs/types';

export class ActivityService {
  static async record(params: {
    userId: string;
    workspaceId: string;
    type: any;
    details?: string;
    jobId?: string | null;
    status?: string;
  }) {
    const recordsPerOrg = 50;
    return prisma.$transaction(async (tx) => {
      const count = await tx.activity.count({
        where: { workspaceId: params.workspaceId },
      });

      if (count >= recordsPerOrg) {
        const oldest = await tx.activity.findFirst({
          where: { workspaceId: params.workspaceId },
          orderBy: { createdAt: 'asc' },
          select: { id: true },
        });

        if (oldest) {
          await tx.activity.delete({
            where: { id: oldest.id },
          });
        }
      }

      return tx.activity.create({
        data: {
          userId: params.userId,
          workspaceId: params.workspaceId,
          type: params.type,
          details: params.details ?? undefined,
          jobId: params.jobId ?? null,
        },
      });
    });
  }

  static async getOrgActivity(workspaceId: string) {
    return prisma.activity.findMany({
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
