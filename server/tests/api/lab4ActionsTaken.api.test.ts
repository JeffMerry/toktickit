import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient, UserRole } from '@prisma/client';
import app from '../../src/app';
import { createSessionToken, hashPassword } from '../../src/utils/auth';

const prisma = new PrismaClient();
let requesterCookie = '';
let otherRequesterCookie = '';
let staffCookie = '';
let requesterId = 0;
let staffId = 0;
let inactiveStaffId = 0;
let ticketId = 0;
let actionId = 0;
let userIds: number[] = [];

async function sessionCookie(userId: number) {
  const token = createSessionToken();
  await prisma.session.create({ data: { tokenHash: token.tokenHash, userId, expiresAt: new Date(Date.now() + 60_000) } });
  return `toktickit_session=${token.rawToken}`;
}

beforeAll(async () => {
  const passwordHash = await hashPassword('ChangeMe123!');
  const [requester, otherRequester, staff, inactiveStaff, category, system] = await Promise.all([
    prisma.user.upsert({ where: { normalizedEmail: 'lab4.actions.requester@example.test' }, update: { isActive: true, mustChangePassword: false, passwordHash }, create: { name: 'Lab 4 Action Requester', email: 'lab4.actions.requester@example.test', normalizedEmail: 'lab4.actions.requester@example.test', passwordHash, role: UserRole.REQUESTER, mustChangePassword: false } }),
    prisma.user.upsert({ where: { normalizedEmail: 'lab4.actions.other@example.test' }, update: { isActive: true, mustChangePassword: false, passwordHash }, create: { name: 'Lab 4 Other Requester', email: 'lab4.actions.other@example.test', normalizedEmail: 'lab4.actions.other@example.test', passwordHash, role: UserRole.REQUESTER, mustChangePassword: false } }),
    prisma.user.upsert({ where: { normalizedEmail: 'lab4.actions.staff@example.test' }, update: { isActive: true, mustChangePassword: false, passwordHash, role: UserRole.IT_STAFF }, create: { name: 'Lab 4 Action Staff', email: 'lab4.actions.staff@example.test', normalizedEmail: 'lab4.actions.staff@example.test', passwordHash, role: UserRole.IT_STAFF, mustChangePassword: false } }),
    prisma.user.upsert({ where: { normalizedEmail: 'lab4.actions.inactive@example.test' }, update: { isActive: false, mustChangePassword: false, passwordHash, role: UserRole.IT_STAFF }, create: { name: 'Lab 4 Inactive Staff', email: 'lab4.actions.inactive@example.test', normalizedEmail: 'lab4.actions.inactive@example.test', passwordHash, role: UserRole.IT_STAFF, isActive: false, mustChangePassword: false } }),
    prisma.category.findFirst({ where: { isActive: true } }),
    prisma.relatedSystem.findFirst({ where: { isActive: true } }),
  ]);
  if (!category || !system) throw new Error('Seeded category and system are required.');
  requesterId = requester.id;
  staffId = staff.id;
  inactiveStaffId = inactiveStaff.id;
  userIds = [requester.id, otherRequester.id, staff.id, inactiveStaff.id];
  await prisma.ticket.deleteMany({ where: { ticketNumber: 'TKT-2026-LAB4-ACTIONS' } });
  const ticket = await prisma.ticket.create({ data: { ticketNumber: 'TKT-2026-LAB4-ACTIONS', requesterId, ownerId: staffId, categoryId: category.id, relatedSystemId: system.id, requestedPriority: 'HIGH', itPriority: 'URGENT', currentStatus: 'IN_PROGRESS', summary: 'Lab 4 Actions API ticket', description: 'Ticket fixture for Actions Taken API coverage.' } });
  ticketId = ticket.id;
  [requesterCookie, otherRequesterCookie, staffCookie] = await Promise.all([sessionCookie(requester.id), sessionCookie(otherRequester.id), sessionCookie(staff.id)]);
});

afterAll(async () => {
  await prisma.ticket.deleteMany({ where: { id: ticketId } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe('Lab 4 Actions Taken API', () => {
  it('creates a planned Action Taken with server-derived creator and audit event', async () => {
    const response = await request(app)
      .post(`/api/staff/tickets/${ticketId}/actions-taken`)
      .set('Cookie', staffCookie)
      .send({ actionOccurredAt: '2026-09-01T09:00:00.000Z', description: 'Inspect the VPN connection logs.', assigneeId: staffId, followUpRequired: true, followUpNote: 'Confirm stability with the requester.', attachmentNotes: 'Check vpn-log.txt.' })
      .expect(201);

    actionId = response.body.id;
    expect(response.body).toMatchObject({ ticketId, status: 'PLANNED', createdBy: { id: staffId }, performedBy: null, assignee: { id: staffId }, followUpRequired: true });
    await expect(prisma.actionTakenEvent.count({ where: { actionTakenId: actionId, eventType: 'CREATED', actorId: staffId } })).resolves.toBe(1);
  });

  it('enforces requester ownership and prevents requester writes', async () => {
    const own = await request(app).get(`/api/tickets/${ticketId}/actions-taken`).set('Cookie', requesterCookie).expect(200);
    expect(own.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: actionId })]));
    await request(app).get(`/api/tickets/${ticketId}/actions-taken`).set('Cookie', otherRequesterCookie).expect(404);
    await request(app).post(`/api/staff/tickets/${ticketId}/actions-taken`).set('Cookie', requesterCookie).send({}).expect(403);
  });

  it('rejects inactive assignees and missing conditional follow-up notes', async () => {
    await request(app)
      .post(`/api/staff/tickets/${ticketId}/actions-taken`)
      .set('Cookie', staffCookie)
      .send({ actionOccurredAt: '2026-09-01T10:00:00.000Z', description: 'Invalid assignee fixture.', assigneeId: inactiveStaffId, followUpRequired: false })
      .expect(422);
    await request(app)
      .post(`/api/staff/tickets/${ticketId}/actions-taken`)
      .set('Cookie', staffCookie)
      .send({ actionOccurredAt: '2026-09-01T10:00:00.000Z', description: 'Missing follow-up fixture.', assigneeId: staffId, followUpRequired: true })
      .expect(400);
  });

  it('transitions an Action Taken safely and rejects stale edits', async () => {
    const initial = await prisma.actionTaken.findUniqueOrThrow({ where: { id: actionId }, select: { updatedAt: true } });
    const started = await request(app)
      .patch(`/api/staff/actions-taken/${actionId}/status`)
      .set('Cookie', staffCookie)
      .send({ status: 'IN_PROGRESS', expectedUpdatedAt: initial.updatedAt.toISOString() })
      .expect(200);
    await request(app)
      .patch(`/api/staff/actions-taken/${actionId}`)
      .set('Cookie', staffCookie)
      .send({ description: 'Stale edit must not overwrite.', expectedUpdatedAt: initial.updatedAt.toISOString() })
      .expect(409);
    await request(app)
      .patch(`/api/staff/actions-taken/${actionId}/status`)
      .set('Cookie', staffCookie)
      .send({ status: 'COMPLETED', expectedUpdatedAt: started.body.updatedAt })
      .expect(422);
    const completed = await request(app)
      .patch(`/api/staff/actions-taken/${actionId}/status`)
      .set('Cookie', staffCookie)
      .send({ status: 'COMPLETED', result: 'The VPN connection remained stable during verification.', expectedUpdatedAt: started.body.updatedAt })
      .expect(200);
    expect(completed.body).toMatchObject({ status: 'COMPLETED', performedBy: { id: staffId } });
    await expect(prisma.actionTakenEvent.count({ where: { actionTakenId: actionId, eventType: 'STATUS_CHANGED' } })).resolves.toBe(2);
  });
});
