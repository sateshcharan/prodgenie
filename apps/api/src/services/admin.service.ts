import { prisma } from '@prodgenie/libs/db';

export const AdminService = {
  getEventDetails: async (eventId: string) => {
    const data = await prisma.event.findUnique({
      where: { id: eventId },
    });

    return data;
  },

  approveEvent: async (eventId: string) => {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new Error('Event not found');

    const updatedEvent = await prisma.$transaction(async (tx) => {
      // 1. Update event
      const updated = await tx.event.update({
        where: { id: event.id },
        data: {
          status: 'approved',
          progress: 100,
        },
      });

      // 2. Handle different event types
      if (event.type === 'credit_topup' || event.type === 'manual_qr') {
        await tx.workspace.update({
          where: { id: event.workspaceId },
          data: {
            credits: { increment: event.creditChange || 0 },
          },
        });
      }

      if (event.type === 'subscription') {
        await tx.workspace.update({
          where: { id: event.workspaceId },
          data: {
            planExpiry: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000 // ✅ +30 days (safe)
            ),
          },
        });
      }

      return updated; // ✅ IMPORTANT
    });

    return updatedEvent;
  },

  rejectEvent: async (eventId: string, remark: string) => {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new Error('Event not found');

    const data = await prisma.event.update({
      where: { id: event.id },
      data: {
        status: 'rejected',
        description: remark || '',
      },
    });

    // mark payment as failed : TODO 
    // const payment = await prisma.payment.update({
    //   where: { id: event.paymentId },
    //   data: {
    //     status: 'rejected',
    //   },
    // });

    return data;
  },
};
