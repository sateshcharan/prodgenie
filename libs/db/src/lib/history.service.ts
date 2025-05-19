import { prisma } from '@prodgenie/libs/prisma';

export class HistoryService {
  static async record(params: {
    userId: string;
    orgId: string;
    action: string;
    details?: string;
    jobId?: string | null;
  }) {
    return prisma.history.create({
      data: {
        userId: params.userId,
        orgId: params.orgId,
        action: params.action,
        details: params.details ?? null,
        jobId: params.jobId ?? null,
      },
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
