import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import { hashPassword, normalizeEmail } from '../../src/utils/auth';

const prisma = new PrismaClient();
const email = 'auth.requester@example.test';
const password = 'ChangeMe123!';
const initialEmail = 'auth.initial@example.test';
const inactiveEmail = 'auth.inactive@example.test';
const initialPassword = 'Temporary123!';

beforeAll(async () => {
  await prisma.user.upsert({
    where: { normalizedEmail: normalizeEmail(email) },
    update: { name: 'Auth Requester', email, passwordHash: await hashPassword(password), role: 'REQUESTER', isActive: true, mustChangePassword: false },
    create: { name: 'Auth Requester', email, normalizedEmail: normalizeEmail(email), passwordHash: await hashPassword(password), role: 'REQUESTER', isActive: true, mustChangePassword: false },
  });
  await prisma.user.upsert({
    where: { normalizedEmail: normalizeEmail(initialEmail) },
    update: { name: 'Initial Password User', email: initialEmail, passwordHash: await hashPassword(initialPassword), role: 'REQUESTER', isActive: true, mustChangePassword: true },
    create: { name: 'Initial Password User', email: initialEmail, normalizedEmail: normalizeEmail(initialEmail), passwordHash: await hashPassword(initialPassword), role: 'REQUESTER', isActive: true, mustChangePassword: true },
  });
  await prisma.user.upsert({
    where: { normalizedEmail: normalizeEmail(inactiveEmail) },
    update: { name: 'Inactive User', email: inactiveEmail, passwordHash: await hashPassword(password), role: 'REQUESTER', isActive: false, mustChangePassword: false },
    create: { name: 'Inactive User', email: inactiveEmail, normalizedEmail: normalizeEmail(inactiveEmail), passwordHash: await hashPassword(password), role: 'REQUESTER', isActive: false, mustChangePassword: false },
  });
});

afterAll(async () => {
  for (const testEmail of [email, initialEmail, inactiveEmail]) {
    const user = await prisma.user.findUnique({ where: { normalizedEmail: normalizeEmail(testEmail) }, select: { id: true } });
    if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  }
  await prisma.$disconnect();
});

describe('authentication API', () => {
  it('logs in with a normalized email and returns only safe user data', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: `  ${email.toUpperCase()} `, password });

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie'][0]).toContain('toktickit_session=');
    expect(response.body.user).toMatchObject({ email, role: 'REQUESTER', mustChangePassword: false });
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects invalid credentials without account details', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'WrongPassword123!' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password.');
  });

  it('denies inactive accounts and throttles repeated failed attempts', async () => {
    await request(app).post('/api/auth/login').send({ email: inactiveEmail, password }).expect(403);

    const throttledEmail = 'throttle.requester@example.test';
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await request(app).post('/api/auth/login').send({ email: throttledEmail, password: 'WrongPassword123!' }).expect(401);
    }
    await request(app).post('/api/auth/login').send({ email: throttledEmail, password: 'WrongPassword123!' }).expect(429);
  });

  it('requires a password change before requester routes and replaces old sessions', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: initialEmail, password: initialPassword }).expect(200);
    await agent.get('/api/tickets').expect(403);

    const response = await agent.post('/api/auth/change-password').send({
      currentPassword: initialPassword,
      newPassword: 'UpdatedPassword123!',
      confirmPassword: 'UpdatedPassword123!',
    }).expect(200);
    expect(response.body.user.mustChangePassword).toBe(false);
    await agent.get('/api/tickets').expect(200);
  });

  it('returns the session user and invalidates the session on logout', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email, password }).expect(200);

    const currentUser = await agent.get('/api/auth/me');
    expect(currentUser.status).toBe(200);
    expect(currentUser.body.user.email).toBe(email);

    await agent.post('/api/auth/logout').expect(200);
    await agent.get('/api/auth/me').expect(401);
  });
});
