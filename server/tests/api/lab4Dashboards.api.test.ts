import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient, type TicketStatus } from '@prisma/client';
import app from '../../src/app';
import { createSessionToken, hashPassword } from '../../src/utils/auth';

const prisma = new PrismaClient();
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const ids: number[] = [];
const users: number[] = [];
let ownCookie = '';
let otherCookie = '';
let emptyCookie = '';
let staffCookie = '';
let adminCookie = '';
let requesterId = 0;
let staffId = 0;

async function cookie(userId: number) {
  const token = createSessionToken();
  await prisma.session.create({ data: { tokenHash: token.tokenHash, userId, expiresAt: new Date(Date.now() + 60_000) } });
  return `toktickit_session=${token.rawToken}`;
}

beforeAll(async () => {
  const [category, system, passwordHash] = await Promise.all([
    prisma.category.findFirst({ where: { isActive: true } }),
    prisma.relatedSystem.findFirst({ where: { isActive: true } }),
    hashPassword('DashboardTest123!'),
  ]);
  if (!category || !system) throw new Error('Seeded reference data is required.');
  const makeUser = async (role: 'REQUESTER' | 'IT_STAFF' | 'ADMINISTRATOR', name: string) => {
    const email = `${name}-${suffix}@example.test`;
    const user = await prisma.user.create({ data: { name, email, normalizedEmail: email, passwordHash, role, isActive: true, mustChangePassword: false } });
    users.push(user.id);
    return user.id;
  };
  requesterId = await makeUser('REQUESTER', 'dashboard-owner');
  const otherId = await makeUser('REQUESTER', 'dashboard-other');
  const emptyId = await makeUser('REQUESTER', 'dashboard-empty');
  staffId = await makeUser('IT_STAFF', 'dashboard-staff');
  const adminId = await makeUser('ADMINISTRATOR', 'dashboard-admin');
  [ownCookie, otherCookie, emptyCookie, staffCookie, adminCookie] = await Promise.all([cookie(requesterId), cookie(otherId), cookie(emptyId), cookie(staffId), cookie(adminId)]);

  const now = Date.now();
  for (const [index, owner, status, priority, age] of [
    [1, requesterId, 'WAITING_FOR_REQUESTER', 'HIGH', 500],
    [2, requesterId, 'OPEN', 'URGENT', 100],
    [3, requesterId, 'RESOLVED', 'LOW', 300],
    [4, requesterId, 'CLOSED', 'MEDIUM', 31 * 24 * 60 * 60 * 1000],
    [5, otherId, 'OPEN', 'URGENT', 50],
    [6, requesterId, 'NEW', 'MEDIUM', 700],
    [7, requesterId, 'REOPENED', 'HIGH', 800],
  ] as const) {
    const ticket = await prisma.ticket.create({ data: {
      ticketNumber: `DASH-${suffix}-${index}`, requesterId: owner, ownerId: index === 2 ? staffId : null,
      categoryId: category.id, relatedSystemId: system.id, summary: `Dashboard fixture ${index}`,
      description: 'Dashboard API regression fixture', currentStatus: status, requestedPriority: priority,
      itPriority: priority, updatedAt: new Date(now - age),
    } });
    ids.push(ticket.id);
  }
});

afterAll(async () => {
  await prisma.ticket.deleteMany({ where: { id: { in: ids } } });
  await prisma.session.deleteMany({ where: { userId: { in: users } } });
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.$disconnect();
});

describe('Lab 4 dashboard API', () => {
  it('scopes requester metrics and bounded ordered summaries to the session owner', async () => {
    const response = await request(app).get('/api/dashboard/requester').set('Cookie', ownCookie).expect(200);
    expect(response.body.metrics.openTickets.value).toBe(4);
    expect(response.body.metrics.waitingForRequester.value).toBe(1);
    expect(response.body.metrics.recentlyResolved.value).toBe(1);
    expect(response.body.attentionTickets.map((ticket: { id: number }) => ticket.id)).toEqual([ids[1], ids[2], ids[0], ids[5], ids[6]]);
    expect(response.body.recentResolvedTickets.map((ticket: { id: number }) => ticket.id)).toEqual([ids[2]]);
    expect(JSON.stringify(response.body)).not.toContain(`DASH-${suffix}-5`);
    expect(response.body.attentionTickets[0]).not.toHaveProperty('description');
    const empty = await request(app).get('/api/dashboard/requester').set('Cookie', otherCookie).expect(200);
    expect(empty.body.metrics.openTickets.value).toBe(1);
    expect(JSON.stringify(empty.body)).not.toContain(`DASH-${suffix}-1`);
    const zero = await request(app).get('/api/dashboard/requester').set('Cookie', emptyCookie).expect(200);
    expect(Object.values(zero.body.metrics).map((item: any) => item.value)).toEqual([0, 0, 0, 0]);
    expect(zero.body.attentionTickets).toEqual([]);
    await request(app).get('/api/dashboard/requester').set('Cookie', ownCookie).query({ requesterId: otherCookie }).expect(400);
  });

  it('matches authoritative operational counts and denies wrong roles', async () => {
    const response = await request(app).get('/api/dashboard/staff').set('Cookie', staffCookie).expect(200);
    const active: TicketStatus[] = ['NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED'];
    expect(response.body.metrics.unassignedTickets.value).toBe(await prisma.ticket.count({ where: { ownerId: null, currentStatus: { in: active } } }));
    expect(response.body.metrics.myOwnedTickets.value).toBe(await prisma.ticket.count({ where: { ownerId: staffId, currentStatus: { in: active } } }));
    expect(response.body.metrics.urgentActiveTickets.value).toBe(await prisma.ticket.count({ where: { itPriority: 'URGENT', currentStatus: { in: [...active, 'RESOLVED'] } } }));
    expect(response.body.byStatus.find((item: { status: string }) => item.status === 'OPEN').value).toBe(await prisma.ticket.count({ where: { currentStatus: 'OPEN' } }));
    expect(response.body.byItPriority.find((item: { priority: string }) => item.priority === 'URGENT').value).toBe(await prisma.ticket.count({ where: { itPriority: 'URGENT' } }));
    expect(response.body.urgentTickets.length).toBeLessThanOrEqual(5);
    expect(response.body.recentTickets.length).toBeLessThanOrEqual(5);
    const admin = await request(app).get('/api/dashboard/staff').set('Cookie', adminCookie).expect(200);
    expect(admin.body.metrics.myOwnedTickets.value).toBe(0);
    await request(app).get('/api/dashboard/staff').set('Cookie', ownCookie).expect(403);
    await request(app).get('/api/dashboard/requester').set('Cookie', staffCookie).expect(403);
    await request(app).get('/api/dashboard/requester').expect(401);
  });

  it('drill-down filters reproduce active, urgent and recent counts', async () => {
    const requester = await request(app).get('/api/dashboard/requester').set('Cookie', ownCookie).expect(200);
    const open = await request(app).get('/api/tickets').set('Cookie', ownCookie).query({ terminal: false }).expect(200);
    expect(open.body.pagination.total).toBe(requester.body.metrics.openTickets.value);
    const recent = await request(app).get('/api/tickets').set('Cookie', ownCookie).query(requester.body.metrics.recentlyUpdated.drillDown.filters).expect(200);
    expect(recent.body.pagination.total).toBe(requester.body.metrics.recentlyUpdated.value);
    const staff = await request(app).get('/api/dashboard/staff').set('Cookie', staffCookie).expect(200);
    const urgent = await request(app).get('/api/staff/tickets').set('Cookie', staffCookie).query(staff.body.metrics.urgentActiveTickets.drillDown.filters).expect(200);
    expect(urgent.body.pagination.total).toBe(staff.body.metrics.urgentActiveTickets.value);
  });
});
