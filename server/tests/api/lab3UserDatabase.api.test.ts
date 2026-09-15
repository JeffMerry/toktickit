import { afterAll, describe, expect, it } from 'vitest';
import { PrismaClient, Priority, TicketStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

describe('Lab 3 user database seed', () => {
  it('provides active and inactive accounts for every required role', async () => {
    const users = await prisma.user.findMany({
      select: { role: true, isActive: true },
    });

    expect(users.filter((user) => user.role === UserRole.REQUESTER && user.isActive)).toHaveLength(4);
    expect(users.filter((user) => user.role === UserRole.REQUESTER && !user.isActive)).toHaveLength(1);
    expect(users.filter((user) => user.role === UserRole.IT_STAFF && user.isActive)).toHaveLength(3);
    expect(users.filter((user) => user.role === UserRole.IT_STAFF && !user.isActive)).toHaveLength(1);
    expect(users.filter((user) => user.role === UserRole.ADMINISTRATOR && user.isActive)).toHaveLength(1);
  });

  it('persists enum-backed ticket values and staff discussion relations', async () => {
    const ticket = await prisma.ticket.findFirst({
      where: {
        requestedPriority: Priority.URGENT,
        currentStatus: TicketStatus.WAITING_FOR_REQUESTER,
      },
      include: {
        owner: true,
        publicComments: true,
        internalNotes: true,
      },
    });

    expect(ticket).not.toBeNull();
    expect(ticket?.itPriority).toBe(Priority.URGENT);
    expect(ticket?.owner?.role).toBe(UserRole.IT_STAFF);

    const discussionTicket = await prisma.ticket.findUnique({
      where: { ticketNumber: 'TKT-2026-SEED-003' },
      include: { publicComments: true, internalNotes: true },
    });
    expect(discussionTicket?.publicComments.length).toBeGreaterThan(0);
    expect(discussionTicket?.internalNotes.length).toBeGreaterThan(0);
  });

  it('provides an unassigned ticket and requester resolution indication without a formal status change', async () => {
    const unassignedTicket = await prisma.ticket.findUnique({
      where: { ticketNumber: 'TKT-2026-SEED-001' },
    });
    const requesterResolvedTicket = await prisma.ticket.findUnique({
      where: { ticketNumber: 'TKT-2026-SEED-004' },
    });

    expect(unassignedTicket?.ownerId).toBeNull();
    expect(requesterResolvedTicket?.requesterResolvedAt).not.toBeNull();
    expect(requesterResolvedTicket?.currentStatus).toBe(TicketStatus.WAITING_FOR_REQUESTER);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
