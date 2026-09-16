import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import { hashPassword, normalizeEmail } from '../../src/utils/auth';

const prisma = new PrismaClient();
const email = 'auth.requester@example.test';
const password = 'ChangeMe123!';

beforeAll(async () => {
  await prisma.user.upsert({
    where: { normalizedEmail: normalizeEmail(email) },
    update: { name: 'Auth Requester', email, passwordHash: await hashPassword(password), role: 'REQUESTER', isActive: true, mustChangePassword: false },
    create: { name: 'Auth Requester', email, normalizedEmail: normalizeEmail(email), passwordHash: await hashPassword(password), role: 'REQUESTER', isActive: true, mustChangePassword: false },
  });
});

afterAll(async () => {
  const user = await prisma.user.findUnique({ where: { normalizedEmail: normalizeEmail(email) }, select: { id: true } });
  if (user) {
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
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
