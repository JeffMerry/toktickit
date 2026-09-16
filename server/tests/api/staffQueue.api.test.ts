import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient, TicketStatus } from '@prisma/client';
import app from '../../src/app';
import { createSessionToken, hashPassword } from '../../src/utils/auth';

const prisma = new PrismaClient();
let staffCookie = '';
let adminCookie = '';
let requesterCookie = '';
let userIds: number[] = [];
let ticketIds: number[] = [];
let queueTicketId = 0;

async function createSessionCookie(userId: number) {
  const token = createSessionToken();
  await prisma.session.create({ data: { tokenHash: token.tokenHash, userId, expiresAt: new Date(Date.now() + 60_000) } });
  return `toktickit_session=${token.rawToken}`;
}

beforeAll(async () => {
  const passwordHash = await hashPassword('ChangeMe123!');
  const [staff, admin, requester, category, system] = await Promise.all([
    prisma.user.create({ data: { name: 'Queue Staff', email: 'queue.staff@example.test', normalizedEmail: 'queue.staff@example.test', passwordHash, role: 'IT_STAFF', mustChangePassword: false } }),
    prisma.user.create({ data: { name: 'Queue Admin', email: 'queue.admin@example.test', normalizedEmail: 'queue.admin@example.test', passwordHash, role: 'ADMINISTRATOR', mustChangePassword: false } }),
    prisma.user.create({ data: { name: 'Queue Requester', email: 'queue.requester@example.test', normalizedEmail: 'queue.requester@example.test', passwordHash, role: 'REQUESTER', mustChangePassword: false } }),
    prisma.category.findFirst({ where: { isActive: true } }),
    prisma.relatedSystem.findFirst({ where: { isActive: true } }),
  ]);
  if (!category || !system) throw new Error('Seeded category and system are required.');
  userIds = [staff.id, admin.id, requester.id];
  [staffCookie, adminCookie, requesterCookie] = await Promise.all([
    createSessionCookie(staff.id), createSessionCookie(admin.id), createSessionCookie(requester.id),
  ]);
  const tickets = await prisma.ticket.createManyAndReturn({ data: [
    { ticketNumber: 'TKT-2026-QUEUE-A', requesterId: requester.id, categoryId: category.id, relatedSystemId: system.id, requestedPriority: 'HIGH', itPriority: 'URGENT', currentStatus: TicketStatus.NEW, summary: 'Queue Alpha unassigned issue', description: 'A ticket used to test the shared operational queue.' },
    { ticketNumber: 'TKT-2026-QUEUE-B', requesterId: requester.id, ownerId: staff.id, categoryId: category.id, relatedSystemId: system.id, requestedPriority: 'LOW', itPriority: 'MEDIUM', currentStatus: TicketStatus.IN_PROGRESS, summary: 'Queue Beta assigned issue', description: 'An assigned ticket used to test queue filters.' },
  ] });
  ticketIds = tickets.map((ticket) => ticket.id);
  queueTicketId = tickets.find((ticket) => ticket.ticketNumber === 'TKT-2026-QUEUE-A')!.id;
  await Promise.all([
    prisma.attachment.create({ data: { ticketId: queueTicketId, fileName: 'queue-detail.pdf', fileSize: 100, mimeType: 'application/pdf', storagePath: '/uploads/queue-detail.pdf' } }),
    prisma.publicComment.create({ data: { ticketId: queueTicketId, authorId: staff.id, content: 'Queue detail public comment.' } }),
    prisma.internalNote.create({ data: { ticketId: queueTicketId, authorId: staff.id, content: 'Queue detail internal note.' } }),
  ]);
});

afterAll(async () => {
  await prisma.attachment.deleteMany({ where: { ticketId: { in: ticketIds } } });
  await prisma.publicComment.deleteMany({ where: { ticketId: { in: ticketIds } } });
  await prisma.internalNote.deleteMany({ where: { ticketId: { in: ticketIds } } });
  await prisma.ticket.deleteMany({ where: { id: { in: ticketIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe('staff ticket queue API', () => {
  it('returns requester identity and matching unassigned tickets to IT staff', async () => {
    const response = await request(app)
      .get('/api/staff/tickets')
      .query({ search: 'Queue Alpha', assignment: 'unassigned', itPriority: 'URGENT', sortBy: 'ticketNumber', sortOrder: 'asc', limit: 1 })
      .set('Cookie', staffCookie);

    expect(response.status).toBe(200);
    expect(response.body.pagination).toMatchObject({ total: 1, page: 1, limit: 1, totalPages: 1 });
    expect(response.body.data[0]).toMatchObject({ ticketNumber: 'TKT-2026-QUEUE-A', ownerId: null, requester: { email: 'queue.requester@example.test' } });
  });

  it('allows administrators and rejects requester sessions', async () => {
    await request(app).get('/api/staff/tickets').set('Cookie', adminCookie).expect(200);
    await request(app).get('/api/staff/tickets').set('Cookie', requesterCookie).expect(403);
    await request(app).get('/api/staff/tickets').expect(401);
  });

  it('validates queue filters', async () => {
    await request(app).get('/api/staff/tickets').query({ assignment: 'mine' }).set('Cookie', staffCookie).expect(400);
    await request(app).get('/api/staff/tickets').query({ requestedPriority: 'P0' }).set('Cookie', staffCookie).expect(400);
  });

  it('returns operational detail, eligible owners, and private notes only to operational roles', async () => {
    const response = await request(app).get(`/api/staff/tickets/${queueTicketId}`).set('Cookie', staffCookie);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ticketNumber: 'TKT-2026-QUEUE-A',
      requester: { email: 'queue.requester@example.test' },
      allowedNextStatuses: ['OPEN', 'CANCELLED'],
    });
    expect(response.body.eligibleOwners).toEqual(expect.arrayContaining([expect.objectContaining({ id: userIds[0], role: 'IT_STAFF' })]));
    expect(response.body.attachments[0]).toMatchObject({ fileName: 'queue-detail.pdf', isRemoved: false });
    expect(response.body.publicComments[0]).toMatchObject({ content: 'Queue detail public comment.' });
    expect(response.body.internalNotes[0]).toMatchObject({ content: 'Queue detail internal note.' });

    await request(app).get(`/api/staff/tickets/${queueTicketId}`).set('Cookie', requesterCookie).expect(403);
  });

  it('claims an unassigned ticket atomically and rejects a competing claim', async () => {
    const ticket = await prisma.ticket.findUniqueOrThrow({ where: { id: queueTicketId }, select: { updatedAt: true } });
    const claimed = await request(app)
      .post(`/api/staff/tickets/${queueTicketId}/claim`)
      .set('Cookie', staffCookie)
      .send({ expectedUpdatedAt: ticket.updatedAt.toISOString() });

    expect(claimed.status).toBe(200);
    expect(claimed.body.owner).toMatchObject({ id: userIds[0], role: 'IT_STAFF' });

    const competing = await request(app)
      .post(`/api/staff/tickets/${queueTicketId}/claim`)
      .set('Cookie', adminCookie)
      .send({ expectedUpdatedAt: ticket.updatedAt.toISOString() });
    expect(competing.status).toBe(409);
    expect(competing.body.error).toBe('Ticket is already assigned.');
  });
});
