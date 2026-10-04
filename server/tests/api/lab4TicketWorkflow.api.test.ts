import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient, TicketStatus, UserRole } from '@prisma/client';
import app from '../../src/app';
import { createSessionToken, hashPassword } from '../../src/utils/auth';

const prisma = new PrismaClient();
let requesterCookie = '';
let otherRequesterCookie = '';
let staffCookie = '';
let requesterId = 0;
let otherRequesterId = 0;
let staffId = 0;
let workflowTicketId = 0;
let indicationTicketId = 0;
let inactiveOwnerTicketId = 0;
let staleActionTicketId = 0;
let ticketIds: number[] = [];
let userIds: number[] = [];

async function sessionCookie(userId: number) {
  const token = createSessionToken();
  await prisma.session.create({ data: { tokenHash: token.tokenHash, userId, expiresAt: new Date(Date.now() + 60_000) } });
  return `toktickit_session=${token.rawToken}`;
}

beforeAll(async () => {
  const passwordHash = await hashPassword('ChangeMe123!');
  const [requester, otherRequester, staff, inactiveStaff, category, system] = await Promise.all([
    prisma.user.upsert({ where: { normalizedEmail: 'lab4.workflow.requester@example.test' }, update: { isActive: true, mustChangePassword: false, passwordHash }, create: { name: 'Lab 4 Workflow Requester', email: 'lab4.workflow.requester@example.test', normalizedEmail: 'lab4.workflow.requester@example.test', passwordHash, role: UserRole.REQUESTER, mustChangePassword: false } }),
    prisma.user.upsert({ where: { normalizedEmail: 'lab4.workflow.other@example.test' }, update: { isActive: true, mustChangePassword: false, passwordHash }, create: { name: 'Lab 4 Other Workflow Requester', email: 'lab4.workflow.other@example.test', normalizedEmail: 'lab4.workflow.other@example.test', passwordHash, role: UserRole.REQUESTER, mustChangePassword: false } }),
    prisma.user.upsert({ where: { normalizedEmail: 'lab4.workflow.staff@example.test' }, update: { isActive: true, mustChangePassword: false, passwordHash, role: UserRole.IT_STAFF }, create: { name: 'Lab 4 Workflow Staff', email: 'lab4.workflow.staff@example.test', normalizedEmail: 'lab4.workflow.staff@example.test', passwordHash, role: UserRole.IT_STAFF, mustChangePassword: false } }),
    prisma.user.upsert({ where: { normalizedEmail: 'lab4.workflow.inactive@example.test' }, update: { isActive: false, mustChangePassword: false, passwordHash, role: UserRole.IT_STAFF }, create: { name: 'Lab 4 Inactive Workflow Staff', email: 'lab4.workflow.inactive@example.test', normalizedEmail: 'lab4.workflow.inactive@example.test', passwordHash, role: UserRole.IT_STAFF, isActive: false, mustChangePassword: false } }),
    prisma.category.findFirst({ where: { isActive: true } }),
    prisma.relatedSystem.findFirst({ where: { isActive: true } }),
  ]);
  if (!category || !system) throw new Error('Seeded category and system are required.');

  requesterId = requester.id;
  otherRequesterId = otherRequester.id;
  staffId = staff.id;
  userIds = [requester.id, otherRequester.id, staff.id, inactiveStaff.id];
  await prisma.ticket.deleteMany({ where: { ticketNumber: { in: ['TKT-2026-LAB4-WORKFLOW', 'TKT-2026-LAB4-INDICATION', 'TKT-2026-LAB4-INACTIVE-OWNER', 'TKT-2026-LAB4-STALE-ACTION'] } } });
  const tickets = await prisma.ticket.createManyAndReturn({ data: [
    { ticketNumber: 'TKT-2026-LAB4-WORKFLOW', requesterId, ownerId: staff.id, categoryId: category.id, relatedSystemId: system.id, requestedPriority: 'HIGH', itPriority: 'HIGH', currentStatus: TicketStatus.IN_PROGRESS, summary: 'Lab 4 workflow resolution gate', description: 'Ticket fixture for workflow validation.' },
    { ticketNumber: 'TKT-2026-LAB4-INDICATION', requesterId, categoryId: category.id, relatedSystemId: system.id, requestedPriority: 'MEDIUM', itPriority: 'MEDIUM', currentStatus: TicketStatus.WAITING_FOR_REQUESTER, summary: 'Lab 4 requester indication', description: 'Ticket fixture for requester advisory indication.' },
    { ticketNumber: 'TKT-2026-LAB4-INACTIVE-OWNER', requesterId, ownerId: inactiveStaff.id, categoryId: category.id, relatedSystemId: system.id, requestedPriority: 'LOW', itPriority: 'LOW', currentStatus: TicketStatus.NEW, summary: 'Lab 4 inactive owner', description: 'Ticket fixture for active owner validation.' },
    { ticketNumber: 'TKT-2026-LAB4-STALE-ACTION', requesterId, ownerId: staff.id, categoryId: category.id, relatedSystemId: system.id, requestedPriority: 'HIGH', itPriority: 'HIGH', currentStatus: TicketStatus.IN_PROGRESS, summary: 'Lab 4 stale action guard', description: 'Ticket fixture for action and resolution concurrency coverage.' },
  ] });
  ticketIds = tickets.map((ticket) => ticket.id);
  workflowTicketId = tickets.find((ticket) => ticket.ticketNumber === 'TKT-2026-LAB4-WORKFLOW')!.id;
  indicationTicketId = tickets.find((ticket) => ticket.ticketNumber === 'TKT-2026-LAB4-INDICATION')!.id;
  inactiveOwnerTicketId = tickets.find((ticket) => ticket.ticketNumber === 'TKT-2026-LAB4-INACTIVE-OWNER')!.id;
  staleActionTicketId = tickets.find((ticket) => ticket.ticketNumber === 'TKT-2026-LAB4-STALE-ACTION')!.id;
  [requesterCookie, otherRequesterCookie, staffCookie] = await Promise.all([
    sessionCookie(requester.id),
    sessionCookie(otherRequester.id),
    sessionCookie(staff.id),
  ]);
});

afterAll(async () => {
  await prisma.ticket.deleteMany({ where: { id: { in: ticketIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe('Lab 4 ticket workflow API', () => {
  it('records an owned requester indication once without changing the formal status', async () => {
    await request(app)
      .post(`/api/tickets/${indicationTicketId}/resolution-indication`)
      .set('Cookie', requesterCookie)
      .send({ requesterId: otherRequesterId })
      .expect(400);

    const first = await request(app)
      .post(`/api/tickets/${indicationTicketId}/resolution-indication`)
      .set('Cookie', requesterCookie)
      .send({})
      .expect(200);
    expect(first.body).toMatchObject({ id: indicationTicketId, currentStatus: 'WAITING_FOR_REQUESTER' });
    expect(first.body.requesterResolvedAt).toBeTruthy();

    const repeated = await request(app)
      .post(`/api/tickets/${indicationTicketId}/resolution-indication`)
      .set('Cookie', requesterCookie)
      .send({})
      .expect(200);
    expect(repeated.body).toMatchObject({ currentStatus: 'WAITING_FOR_REQUESTER', requesterResolvedAt: first.body.requesterResolvedAt });

    await request(app).post(`/api/tickets/${indicationTicketId}/resolution-indication`).set('Cookie', otherRequesterCookie).send({}).expect(404);
    await request(app).post(`/api/tickets/${indicationTicketId}/resolution-indication`).set('Cookie', staffCookie).send({}).expect(403);
  });

  it('enforces the resolution gate and preserves ticket state for rejected requests', async () => {
    const initial = await prisma.ticket.findUniqueOrThrow({ where: { id: workflowTicketId }, select: { updatedAt: true, currentStatus: true } });
    const resolve = (expectedUpdatedAt: string) => request(app)
      .patch(`/api/staff/tickets/${workflowTicketId}/status`)
      .set('Cookie', staffCookie)
      .send({ currentStatus: 'RESOLVED', confirmed: true, expectedUpdatedAt });

    await resolve(initial.updatedAt.toISOString()).expect(422);
    await expect(prisma.ticket.findUniqueOrThrow({ where: { id: workflowTicketId }, select: { currentStatus: true } })).resolves.toMatchObject({ currentStatus: TicketStatus.IN_PROGRESS });

    const completedAction = await prisma.actionTaken.create({
      data: {
        ticketId: workflowTicketId,
        createdById: staffId,
        performedById: staffId,
        actionOccurredAt: new Date(),
        description: 'Complete a diagnostic action.',
        result: '   ',
        status: 'COMPLETED',
      },
    });
    await resolve(initial.updatedAt.toISOString()).expect(422);

    await prisma.actionTaken.update({ where: { id: completedAction.id }, data: { result: 'The diagnostic confirms the service is working.' } });
    const followUp = await prisma.actionTaken.create({
      data: {
        ticketId: workflowTicketId,
        createdById: staffId,
        actionOccurredAt: new Date(),
        description: 'Check back with the requester.',
        followUpRequired: true,
        followUpNote: 'Confirm the service after the fix.',
        status: 'PLANNED',
      },
    });
    await resolve(initial.updatedAt.toISOString()).expect(422);

    await prisma.actionTaken.update({ where: { id: followUp.id }, data: { status: 'CANCELLED' } });
    const resolved = await resolve(initial.updatedAt.toISOString()).expect(200);
    expect(resolved.body.currentStatus).toBe('RESOLVED');

    await request(app)
      .patch(`/api/staff/tickets/${workflowTicketId}/status`)
      .set('Cookie', staffCookie)
      .send({ currentStatus: 'CLOSED', confirmed: true, expectedUpdatedAt: initial.updatedAt.toISOString() })
      .expect(409);
  });

  it('requires an active operational owner before work can begin', async () => {
    const ticket = await prisma.ticket.findUniqueOrThrow({ where: { id: inactiveOwnerTicketId }, select: { updatedAt: true } });
    await request(app)
      .patch(`/api/staff/tickets/${inactiveOwnerTicketId}/status`)
      .set('Cookie', staffCookie)
      .send({ currentStatus: 'OPEN', expectedUpdatedAt: ticket.updatedAt.toISOString() })
      .expect(422);
  });

  it('rejects a stale resolution request when an Action changes after the Ticket was read', async () => {
    await prisma.actionTaken.create({
      data: {
        ticketId: staleActionTicketId,
        createdById: staffId,
        performedById: staffId,
        actionOccurredAt: new Date(),
        description: 'Verify the service before resolution.',
        result: 'The service is working correctly.',
        status: 'COMPLETED',
      },
    });
    await prisma.ticket.update({ where: { id: staleActionTicketId }, data: { updatedAt: new Date(Date.now() - 1_000) } });
    const beforeAction = await prisma.ticket.findUniqueOrThrow({ where: { id: staleActionTicketId }, select: { updatedAt: true } });

    await request(app)
      .post(`/api/staff/tickets/${staleActionTicketId}/actions-taken`)
      .set('Cookie', staffCookie)
      .send({
        actionOccurredAt: new Date().toISOString(),
        description: 'Confirm the requester follow-up.',
        followUpRequired: true,
        followUpNote: 'Wait for the requester to confirm the outcome.',
      })
      .expect(201);

    const afterAction = await prisma.ticket.findUniqueOrThrow({ where: { id: staleActionTicketId }, select: { updatedAt: true } });
    expect(afterAction.updatedAt.getTime()).toBeGreaterThan(beforeAction.updatedAt.getTime());

    await request(app)
      .patch(`/api/staff/tickets/${staleActionTicketId}/status`)
      .set('Cookie', staffCookie)
      .send({ currentStatus: 'RESOLVED', confirmed: true, expectedUpdatedAt: beforeAction.updatedAt.toISOString() })
      .expect(409);
    await expect(prisma.ticket.findUniqueOrThrow({ where: { id: staleActionTicketId }, select: { currentStatus: true } })).resolves.toMatchObject({ currentStatus: TicketStatus.IN_PROGRESS });

    await request(app)
      .patch(`/api/staff/tickets/${staleActionTicketId}/status`)
      .set('Cookie', staffCookie)
      .send({ currentStatus: 'RESOLVED', confirmed: true, expectedUpdatedAt: afterAction.updatedAt.toISOString() })
      .expect(422);
  });
});
