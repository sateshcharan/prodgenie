import { Prisma } from '@prisma/client';

import { prisma } from './prismaClient.js';
import {
  eventType,
  status,
  // Event,
} from './prismaTypes.js';
// import { sseServer } from '@prodgenie/libs/sse';

export class EventService {
  static async record(params: Prisma.eventUncheckedCreateInput) {
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

      const event = await tx.event.create({
        data: {
          id: params.id,
          userId: params.userId,
          workspaceId: params.workspaceId,
          type: params.type,
          errorData: params.errorData ?? {},
          status: params.status,
          creditChange,
          balanceAfter,
          progress: params.progress,
          description: params.description,
        },
      });

      // // Publish immediately on creation
      // sseServer.publish(
      //   event.workspaceId,
      //   'event_created',
      //   {
      //     jobId: event.id,
      //     status: event.status,
      //     progress: event.progress ?? 0,
      //     message: '',
      //     createdAt: event.createdAt,
      //   },
      //   event.id
      // );

      return event;
    });
  }

  static async recordTx(
    tx: Prisma.TransactionClient,
    // data: EventCreateInput // todo: type this strongly
    data: any
  ) {
    return tx.event.create({ data });
  }

  static async update(id: string, data: any, workspaceId?: string) {
    const updated = await prisma.event.update({
      where: { id },
      data,
    });

    // // Publish workspace-level SSE
    // sseServer.publish(
    //   workspaceId!,
    //   'event_update',
    //   {
    //     jobId: updated.id,
    //     status: updated.status,
    //     progress: updated.progress,
    //     message: data?.reason?.message || '',
    //     updatedAt: updated.updatedAt,
    //   },
    //   updated.id
    // );

    return updated;
  }

  static async updateProgress(
    workspaceId: string,
    jobId: string,
    status: status,
    progress: number,
    message?: string
  ) {
    // Update the event itself
    const event = await this.update(jobId, { status, progress }, workspaceId);

    // Only apply usage tracking for completed jobcards
    if (status === 'completed' && event.type === 'jobcard_generation') {
      const now = new Date();

      await prisma.workspace.update({
        where: {
          id: workspaceId,
        },
        data: {
          jobCardsCount: { increment: 1 },
          updatedAt: now,
        },
      });
    }
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
    type: eventType,
    limit = 10
  ) {
    return prisma.event.findMany({
      where: { workspaceId, type },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
