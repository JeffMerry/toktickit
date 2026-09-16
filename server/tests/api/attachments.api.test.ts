import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient, TicketStatus } from '@prisma/client';
import app from '../../src/app';
import { createSessionToken, hashPassword } from '../../src/utils/auth';

const prisma = new PrismaClient();
let ownerId = 0;
let otherId = 0;
let ownerCookie = '';
let otherCookie = '';
let ticketId = 0;
let attachmentId = 0;

beforeAll(async () => {
  const [owner, other, category, system] = await Promise.all([
    prisma.user.upsert({ where: { normalizedEmail: 'attachment-owner@example.test' }, update: { mustChangePassword: false, isActive: true }, create: { name: 'Attachment Owner', email: 'attachment-owner@example.test', normalizedEmail: 'attachment-owner@example.test', passwordHash: await hashPassword('ChangeMe123!'), role: 'REQUESTER', mustChangePassword: false } }),
    prisma.user.upsert({ where: { normalizedEmail: 'attachment-other@example.test' }, update: { mustChangePassword: false, isActive: true }, create: { name: 'Attachment Other', email: 'attachment-other@example.test', normalizedEmail: 'attachment-other@example.test', passwordHash: await hashPassword('ChangeMe123!'), role: 'REQUESTER', mustChangePassword: false } }),
    prisma.category.findFirst({ where: { isActive: true } }), prisma.relatedSystem.findFirst({ where: { isActive: true } }),
  ]);
  if (!category || !system) throw new Error('Seeded category and system are required.');
  ownerId = owner.id; otherId = other.id;
  const ownerToken = createSessionToken(); const otherToken = createSessionToken();
  ownerCookie = `toktickit_session=${ownerToken.rawToken}`; otherCookie = `toktickit_session=${otherToken.rawToken}`;
  await prisma.session.createMany({ data: [{ tokenHash: ownerToken.tokenHash, userId: owner.id, expiresAt: new Date(Date.now() + 60_000) }, { tokenHash: otherToken.tokenHash, userId: other.id, expiresAt: new Date(Date.now() + 60_000) }] });
  const ticket = await prisma.ticket.create({ data: { ticketNumber: 'TKT-2026-AUTH-ATT', requesterId: owner.id, categoryId: category.id, relatedSystemId: system.id, requestedPriority: 'HIGH', currentStatus: TicketStatus.NEW, summary: 'Authenticated attachment ticket', description: 'Ticket used to verify attachment ownership from the session.' } });
  ticketId = ticket.id;
  const attachment = await prisma.attachment.create({ data: { ticketId, fileName: 'test.pdf', fileSize: 100, mimeType: 'application/pdf', storagePath: '/uploads/missing-test.pdf' } });
  attachmentId = attachment.id;
});

afterAll(async () => {
  await prisma.attachment.deleteMany({ where: { ticketId } }); await prisma.ticket.deleteMany({ where: { id: ticketId } });
  await prisma.session.deleteMany({ where: { userId: { in: [ownerId, otherId] } } }); await prisma.user.deleteMany({ where: { id: { in: [ownerId, otherId] } } }); await prisma.$disconnect();
});

describe('attachment ownership through sessions', () => {
  it('conceals another requester ticket and rejects requesterId spoofing', async () => {
    await request(app).get(`/api/tickets/${ticketId}`).set('Cookie', otherCookie).expect(404);
    await request(app).get(`/api/tickets/${ticketId}`).query({ requesterId: otherId }).set('Cookie', ownerCookie).expect(400);
  });

  it('blocks other requester attachment actions and accepts owner soft removal', async () => {
    await request(app).post(`/api/tickets/${ticketId}/attachments`).set('Cookie', otherCookie).attach('attachments', Buffer.from('not allowed'), 'blocked.txt').expect(404);
    const removed = await request(app).delete(`/api/attachments/${attachmentId}`).set('Cookie', ownerCookie).send({ removalReason: 'Regression cleanup.' });
    expect(removed.status).toBe(200); expect(removed.body.isRemoved).toBe(true);
    await request(app).get(`/api/attachments/${attachmentId}/download`).set('Cookie', ownerCookie).expect(403);
  });
});
