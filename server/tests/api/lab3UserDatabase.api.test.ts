import { afterAll, describe, expect, it } from 'vitest';
import { PrismaClient, Priority, TicketStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

describe('Lab 3 user database seed', () => {
  it('provides active and inactive accounts for every required role', async () => {
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: [
            'jennifer.anderson@kmutt.ac.th',
            'michael.brown@kmutt.ac.th',
            'sarah.johnson@kmutt.ac.th',
            'david.lee@kmutt.ac.th',
            'inactive.user@kmutt.ac.th',
            'mary.support@kmutt.ac.th',
            'somchai.technician@kmutt.ac.th',
            'niran.engineer@kmutt.ac.th',
            'inactive.technician@kmutt.ac.th',
            'admin@kmutt.ac.th',
          ],
        },
      },
      select: { email: true, role: true, isActive: true },
    });

    expect(users).toHaveLength(10);
    expect(users).toEqual(expect.arrayContaining([
      expect.objectContaining({ email: 'jennifer.anderson@kmutt.ac.th', role: UserRole.REQUESTER, isActive: true }),
      expect.objectContaining({ email: 'inactive.user@kmutt.ac.th', role: UserRole.REQUESTER, isActive: false }),
      expect.objectContaining({ email: 'mary.support@kmutt.ac.th', role: UserRole.IT_STAFF, isActive: true }),
      expect.objectContaining({ email: 'inactive.technician@kmutt.ac.th', role: UserRole.IT_STAFF, isActive: false }),
      expect.objectContaining({ email: 'admin@kmutt.ac.th', role: UserRole.ADMINISTRATOR, isActive: true }),
    ]));
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
