import { prisma } from '@prodgenie/libs/prisma';
import { JobCardConfig } from './config';

export class CreditService {
  async ensure(workspaceId: string) {
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { credits: true },
    });
    if (!ws || ws.credits < JobCardConfig.creditCost) {
      throw new Error('Not enough credits. Upgrade your plan.');
    }
  }

  async deduct(workspaceId: string) {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { credits: { decrement: JobCardConfig.creditCost } },
    });
  }
}
