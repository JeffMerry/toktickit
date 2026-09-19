import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import { createSessionToken, hashPassword, verifyPassword } from '../../src/utils/auth';

const prisma = new PrismaClient();
let adminCookie = '';
let staffCookie = '';
let requesterCookie = '';
let secondRequesterCookie = '';
let concurrentAdminCookie = '';
let userIds: number[] = [];
let adminId = 0;
let concurrentAdminId = 0;
let staffId = 0;
let secondRequesterId = 0;

async function sessionCookie(userId: number) {
  const token = createSessionToken();
  await prisma.session.create({ data: { tokenHash: token.tokenHash, userId, expiresAt: new Date(Date.now() + 60_000) } });
  return `toktickit_session=${token.rawToken}`;
}

beforeAll(async () => {
  const passwordHash = await hashPassword('ChangeMe123!');
  const [admin, concurrentAdmin, staff, requester, secondRequester] = await Promise.all([
    prisma.user.create({ data: { name: 'Admin Manager', email: 'admin.manager@example.test', normalizedEmail: 'admin.manager@example.test', passwordHash, role: 'ADMINISTRATOR', mustChangePassword: false } }),
    prisma.user.create({ data: { name: 'Concurrent Admin', email: 'concurrent.admin@example.test', normalizedEmail: 'concurrent.admin@example.test', passwordHash, role: 'ADMINISTRATOR', mustChangePassword: false } }),
    prisma.user.create({ data: { name: 'Admin List Staff', email: 'admin.list.staff@example.test', normalizedEmail: 'admin.list.staff@example.test', passwordHash, role: 'IT_STAFF', mustChangePassword: false } }),
    prisma.user.create({ data: { name: 'Admin List Requester', email: 'admin.list.requester@example.test', normalizedEmail: 'admin.list.requester@example.test', passwordHash, role: 'REQUESTER', mustChangePassword: false } }),
    prisma.user.create({ data: { name: 'Second Requester', email: 'second.requester@example.test', normalizedEmail: 'second.requester@example.test', passwordHash, role: 'REQUESTER', mustChangePassword: false } }),
  ]);
  adminId = admin.id;
  concurrentAdminId = concurrentAdmin.id;
  staffId = staff.id;
  secondRequesterId = secondRequester.id;
  userIds = [admin.id, concurrentAdmin.id, staff.id, requester.id, secondRequester.id];
  [adminCookie, concurrentAdminCookie, staffCookie, requesterCookie, secondRequesterCookie] = await Promise.all([sessionCookie(admin.id), sessionCookie(concurrentAdmin.id), sessionCookie(staff.id), sessionCookie(requester.id), sessionCookie(secondRequester.id)]);
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

  it('updates users with stale-write and self-deactivation safeguards', async () => {
    const staff = await prisma.user.findUniqueOrThrow({ where: { id: staffId }, select: { updatedAt: true } });
    const update = { name: 'Updated Staff', email: 'updated.staff@example.test', role: 'REQUESTER', isActive: true, expectedUpdatedAt: staff.updatedAt.toISOString() };
    const response = await request(app).patch(`/api/admin/users/${staffId}`).set('Cookie', adminCookie).send(update);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: staffId, name: 'Updated Staff', email: 'updated.staff@example.test', role: 'REQUESTER' });
    expect(response.body).not.toHaveProperty('passwordHash');

    await request(app).patch(`/api/admin/users/${staffId}`).set('Cookie', adminCookie).send(update).expect(409);

    const admin = await prisma.user.findUniqueOrThrow({ where: { id: adminId }, select: { name: true, email: true, role: true, updatedAt: true } });
    await request(app)
      .patch(`/api/admin/users/${adminId}`)
      .set('Cookie', adminCookie)
      .send({ ...admin, isActive: false, expectedUpdatedAt: admin.updatedAt.toISOString() })
      .expect(409);
  });

  it('deactivates another user and invalidates their active sessions', async () => {
    const requester = await prisma.user.findUniqueOrThrow({ where: { id: secondRequesterId }, select: { name: true, email: true, role: true, updatedAt: true } });
    const response = await request(app)
      .patch(`/api/admin/users/${secondRequesterId}`)
      .set('Cookie', adminCookie)
      .send({ ...requester, isActive: false, expectedUpdatedAt: requester.updatedAt.toISOString() });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: secondRequesterId, isActive: false });
    await request(app).get('/api/auth/me').set('Cookie', secondRequesterCookie).expect(401);
  });

  it('serializes concurrent administrator removals so one active administrator remains', async () => {
    const externalActiveAdmins = await prisma.user.findMany({
      where: { role: 'ADMINISTRATOR', isActive: true, id: { notIn: [adminId, concurrentAdminId] } },
      select: { id: true },
    });
    await prisma.user.updateMany({ where: { id: { in: externalActiveAdmins.map((user) => user.id) } }, data: { isActive: false } });

    try {
      const [firstAdmin, secondAdmin] = await Promise.all([
        prisma.user.findUniqueOrThrow({ where: { id: adminId }, select: { name: true, email: true, role: true, updatedAt: true } }),
        prisma.user.findUniqueOrThrow({ where: { id: concurrentAdminId }, select: { name: true, email: true, role: true, updatedAt: true } }),
      ]);
      const [firstResult, secondResult] = await Promise.all([
        request(app).patch(`/api/admin/users/${concurrentAdminId}`).set('Cookie', adminCookie).send({ ...secondAdmin, isActive: false, expectedUpdatedAt: secondAdmin.updatedAt.toISOString() }),
        request(app).patch(`/api/admin/users/${adminId}`).set('Cookie', concurrentAdminCookie).send({ ...firstAdmin, isActive: false, expectedUpdatedAt: firstAdmin.updatedAt.toISOString() }),
      ]);

      expect([firstResult.status, secondResult.status].sort()).toEqual([200, 409]);
      await expect(prisma.user.count({ where: { role: 'ADMINISTRATOR', isActive: true } })).resolves.toBe(1);
    } finally {
      await prisma.user.updateMany({ where: { id: { in: [adminId, concurrentAdminId, ...externalActiveAdmins.map((user) => user.id)] } }, data: { role: 'ADMINISTRATOR', isActive: true } });
      [adminCookie, concurrentAdminCookie] = await Promise.all([sessionCookie(adminId), sessionCookie(concurrentAdminId)]);
    }
  });

  it('resets an initial password, requires a change, and revokes current sessions', async () => {
    const response = await request(app)
      .post(`/api/admin/users/${staffId}/initial-password`)
      .set('Cookie', adminCookie)
      .send({ initialPassword: 'ResetPassword123!', confirmPassword: 'ResetPassword123!' });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: staffId, mustChangePassword: true });
    expect(response.body).not.toHaveProperty('passwordHash');

    const saved = await prisma.user.findUniqueOrThrow({ where: { id: staffId }, select: { passwordHash: true, mustChangePassword: true } });
    await expect(verifyPassword('ResetPassword123!', saved.passwordHash)).resolves.toBe(true);
    expect(saved.mustChangePassword).toBe(true);
    await request(app).get('/api/auth/me').set('Cookie', staffCookie).expect(401);
  });
});
