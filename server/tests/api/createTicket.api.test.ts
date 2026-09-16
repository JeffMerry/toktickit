import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import { createSessionToken, hashPassword } from '../../src/utils/auth';

const prisma = new PrismaClient();
let userId = 0;
let cookie = '';
let categoryId = 0;
let relatedSystemId = 0;

beforeAll(async () => {
  const user = await prisma.user.upsert({ where: { normalizedEmail: 'create-ticket@example.test' }, update: { mustChangePassword: false, isActive: true }, create: { name: 'Create Ticket Requester', email: 'create-ticket@example.test', normalizedEmail: 'create-ticket@example.test', passwordHash: await hashPassword('ChangeMe123!'), role: 'REQUESTER', mustChangePassword: false } });
  userId = user.id;
  const token = createSessionToken();
  await prisma.session.create({ data: { tokenHash: token.tokenHash, userId, expiresAt: new Date(Date.now() + 60_000) } });
  cookie = `toktickit_session=${token.rawToken}`;
  const category = await prisma.category.findFirst({ where: { isActive: true } });
  const system = await prisma.relatedSystem.findFirst({ where: { isActive: true } });
  if (!category || !system) throw new Error('Seeded category and system are required.');
  categoryId = category.id;
  relatedSystemId = system.id;
});

afterAll(async () => {
  await prisma.ticket.deleteMany({ where: { requesterId: userId, summary: { contains: 'Authenticated create ticket' } } });
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

describe('POST /api/tickets API', () => {
  const validTicket = { categoryId: 0, relatedSystemId: 0, requestedPriority: 'HIGH', summary: 'Authenticated create ticket', description: 'A valid authenticated requester ticket description.' };

  it('creates a ticket for the session requester', async () => {
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ ...validTicket, categoryId, relatedSystemId });
    expect(response.status).toBe(201);
    expect(response.body.requesterId).toBe(userId);
    expect(response.body.currentStatus).toBe('NEW');
  });

  it('rejects a client-supplied requesterId', async () => {
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ ...validTicket, categoryId, relatedSystemId, requesterId: 999999 });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/requesterId/);
  });

  it('requires an authenticated session', async () => {
    const response = await request(app).post('/api/tickets').send({ ...validTicket, categoryId, relatedSystemId });
    expect(response.status).toBe(401);
  });
});
