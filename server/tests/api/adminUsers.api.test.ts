import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import { createSessionToken, hashPassword, verifyPassword } from '../../src/utils/auth';

const prisma = new PrismaClient();
let adminCookie = '';
let staffCookie = '';
let requesterCookie = '';
let userIds: number[] = [];

async function sessionCookie(userId: number) {
  const token = createSessionToken();
  await prisma.session.create({ data: { tokenHash: token.tokenHash, userId, expiresAt: new Date(Date.now() + 60_000) } });
  return `toktickit_session=${token.rawToken}`;
}

beforeAll(async () => {
  const passwordHash = await hashPassword('ChangeMe123!');
  const [admin, staff, requester, secondRequester] = await Promise.all([
    prisma.user.create({ data: { name: 'Admin Manager', email: 'admin.manager@example.test', normalizedEmail: 'admin.manager@example.test', passwordHash, role: 'ADMINISTRATOR', mustChangePassword: false } }),
    prisma.user.create({ data: { name: 'Admin List Staff', email: 'admin.list.staff@example.test', normalizedEmail: 'admin.list.staff@example.test', passwordHash, role: 'IT_STAFF', mustChangePassword: false } }),
    prisma.user.create({ data: { name: 'Admin List Requester', email: 'admin.list.requester@example.test', normalizedEmail: 'admin.list.requester@example.test', passwordHash, role: 'REQUESTER', mustChangePassword: false } }),
    prisma.user.create({ data: { name: 'Second Requester', email: 'second.requester@example.test', normalizedEmail: 'second.requester@example.test', passwordHash, role: 'REQUESTER', mustChangePassword: false } }),
  ]);
  userIds = [admin.id, staff.id, requester.id, secondRequester.id];
  [adminCookie, staffCookie, requesterCookie] = await Promise.all([sessionCookie(admin.id), sessionCookie(staff.id), sessionCookie(requester.id)]);
});

afterAll(async () => {
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe('administrator user list API', () => {
  it('lists safe user rows with search, role filtering, and pagination', async () => {
    const response = await request(app).get('/api/admin/users').query({ search: 'admin.list', role: 'REQUESTER', limit: 1 }).set('Cookie', adminCookie);
    expect(response.status).toBe(200);
    expect(response.body.pagination).toMatchObject({ total: 1, page: 1, limit: 1, totalPages: 1 });
    expect(response.body.data[0]).toMatchObject({ email: 'admin.list.requester@example.test', role: 'REQUESTER' });
    expect(response.body.data[0]).not.toHaveProperty('passwordHash');
    expect(response.body.data[0]).not.toHaveProperty('normalizedEmail');
  });

  it('limits the endpoint to administrators', async () => {
    await request(app).get('/api/admin/users').set('Cookie', staffCookie).expect(403);
    await request(app).get('/api/admin/users').set('Cookie', requesterCookie).expect(403);
    await request(app).get('/api/admin/users').expect(401);
  });

  it('creates a user with a hashed initial password and change requirement', async () => {
    const response = await request(app)
      .post('/api/admin/users')
      .set('Cookie', adminCookie)
      .send({ name: 'Created Staff', email: 'created.staff@example.test', role: 'IT_STAFF', isActive: true, initialPassword: 'CreatedPassword123!' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ email: 'created.staff@example.test', role: 'IT_STAFF', isActive: true, mustChangePassword: true });
    expect(response.body).not.toHaveProperty('passwordHash');
    userIds.push(response.body.id);
    const saved = await prisma.user.findUniqueOrThrow({ where: { id: response.body.id }, select: { passwordHash: true } });
    await expect(verifyPassword('CreatedPassword123!', saved.passwordHash)).resolves.toBe(true);

    await request(app)
      .post('/api/admin/users')
      .set('Cookie', adminCookie)
      .send({ name: 'Duplicate Staff', email: 'CREATED.STAFF@example.test', role: 'IT_STAFF', isActive: true, initialPassword: 'CreatedPassword123!' })
      .expect(409);
  });
});
