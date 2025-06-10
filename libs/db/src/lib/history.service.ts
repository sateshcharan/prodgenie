import { prisma } from '@prodgenie/libs/prisma';

export class HistoryService {
  static async record(params: {
    userId: string;
    orgId: string;
    action: string;
    details?: string;
    jobId?: string | null;
    status?: string;
  }) {
    const recordsPerOrg = 50;
    return prisma.$transaction(async (tx) => {
      const count = await tx.history.count({
        where: { orgId: params.orgId },
      });

      if (count >= recordsPerOrg) {
        const oldest = await tx.history.findFirst({
          where: { orgId: params.orgId },
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
          orgId: params.orgId,
          action: params.action,
          details: params.details ?? null,
          jobId: params.jobId ?? null,
        },
      });
    });
  }

  static async getOrgHistory(orgId: string) {
    return prisma.history.findMany({
      where: { orgId: orgId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
