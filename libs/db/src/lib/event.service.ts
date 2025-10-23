import { Prisma } from '@prisma/client';

import {
  prisma,
  EventType,
  EventStatus,
  // Event,
} from '@prodgenie/libs/prisma';
import { publish } from '@prodgenie/libs/sse/eventStream.js';

export class EventService {
  static async record(params: Prisma.EventUncheckedCreateInput) {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.findUnique({
        where: { id: params.workspaceId },
        select: { credits: true },
      }); // fetch workspace credits

      if (!workspace) throw new Error('Workspace not found');

      const creditChange = params.creditChange ?? 0;
      const balanceAfter = workspace.credits + creditChange;

      if (creditChange !== 0) {
        await tx.workspace.update({
          where: { id: params.workspaceId },
          data: { credits: balanceAfter },
        });
      }

      return tx.event.create({
        data: {
          id: params.id,
          userId: params.userId,
          workspaceId: params.workspaceId,
          type: params.type,
          errorData: params.errorData ?? {},
          status: params.status,
          creditChange,
          balanceAfter,
        },
      });
    });
  }

  async update(id: string, data: any) {
    const updated = await prisma.event.update({
      where: { id },
      data,
    });

    // Publish to SSE channel for the workspace
    publish(
      updated.workspaceId,
      'event_update',
      {
        eventId: updated.id,
        status: updated.status,
        progress: updated.progress,
        updatedAt: updated.updatedAt,
      },
      updated.id
    ); // use updated.id as SSE id

    return updated;
  }

  async updateProgress(
    jobId: string,
    status: EventStatus,
    progress: number,
    message?: string
  ) {
    await this.update(jobId, {
      status,
      progress,
      // reason: message ? { message } : undefined,
    });

    console.log(`🔹 Job ${jobId} - ${status} (${progress}%): ${message || ''}`);
  }

  static async getWorkspaceEvents(workspaceId: string) {
    return prisma.event.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getRecentByType(
    workspaceId: string,
    type: EventType,
    limit = 10
  ) {
    return prisma.event.findMany({
      where: { workspaceId, type },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
