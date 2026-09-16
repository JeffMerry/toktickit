import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient, TicketStatus } from '@prisma/client';
import app from '../../src/app';
import { createSessionToken, hashPassword } from '../../src/utils/auth';

const prisma = new PrismaClient();
let requesterAId = 0;
let requesterBId = 0;
let requesterACookie = '';

beforeAll(async () => {
  const [a, b, category, system] = await Promise.all([
    prisma.user.upsert({ where: { normalizedEmail: 'tickets-a@example.test' }, update: { mustChangePassword: false, isActive: true }, create: { name: 'Tickets A', email: 'tickets-a@example.test', normalizedEmail: 'tickets-a@example.test', passwordHash: await hashPassword('ChangeMe123!'), role: 'REQUESTER', mustChangePassword: false } }),
    prisma.user.upsert({ where: { normalizedEmail: 'tickets-b@example.test' }, update: { mustChangePassword: false, isActive: true }, create: { name: 'Tickets B', email: 'tickets-b@example.test', normalizedEmail: 'tickets-b@example.test', passwordHash: await hashPassword('ChangeMe123!'), role: 'REQUESTER', mustChangePassword: false } }),
    prisma.category.findFirst({ where: { isActive: true } }), prisma.relatedSystem.findFirst({ where: { isActive: true } }),
  ]);
  if (!category || !system) throw new Error('Seeded category and system are required.');
  requesterAId = a.id; requesterBId = b.id;
  const token = createSessionToken();
  requesterACookie = `toktickit_session=${token.rawToken}`;
  await prisma.session.create({ data: { tokenHash: token.tokenHash, userId: a.id, expiresAt: new Date(Date.now() + 60_000) } });
  await prisma.ticket.createMany({ data: [
    { ticketNumber: 'TKT-2026-AUTH-A1', requesterId: a.id, categoryId: category.id, relatedSystemId: system.id, requestedPriority: 'HIGH', currentStatus: TicketStatus.NEW, summary: 'Authenticated requester A ticket', description: 'Ticket that must only be returned to requester A.' },
    { ticketNumber: 'TKT-2026-AUTH-B1', requesterId: b.id, categoryId: category.id, relatedSystemId: system.id, requestedPriority: 'LOW', currentStatus: TicketStatus.NEW, summary: 'Authenticated requester B ticket', description: 'Ticket that must not be returned to requester A.' },
  ] });
});

afterAll(async () => {
  await prisma.ticket.deleteMany({ where: { ticketNumber: { in: ['TKT-2026-AUTH-A1', 'TKT-2026-AUTH-B1'] } } });
  await prisma.session.deleteMany({ where: { userId: { in: [requesterAId, requesterBId] } } });
  await prisma.user.deleteMany({ where: { id: { in: [requesterAId, requesterBId] } } });
  await prisma.$disconnect();
});

describe('GET /api/tickets API', () => {
  it('returns only tickets owned by the authenticated requester', async () => {
    const response = await request(app).get('/api/tickets').set('Cookie', requesterACookie);
    expect(response.status).toBe(200);
    expect(response.body.data.map((ticket: { ticketNumber: string }) => ticket.ticketNumber)).toContain('TKT-2026-AUTH-A1');
    expect(response.body.data.map((ticket: { ticketNumber: string }) => ticket.ticketNumber)).not.toContain('TKT-2026-AUTH-B1');
  });

  it('rejects requesterId spoofing and missing sessions', async () => {
    await request(app).get('/api/tickets').query({ requesterId: requesterBId }).set('Cookie', requesterACookie).expect(400);
    await request(app).get('/api/tickets').expect(401);
  });
});
