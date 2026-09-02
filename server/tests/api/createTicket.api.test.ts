import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('POST /api/tickets API', () => {
  let activeRequesterId: number;
  let activeCategoryId: number;
  let activeSystemId: number;

  beforeAll(async () => {
    // Fetch active seeded records
    const reqUser = await prisma.requesterUser.findFirst({ where: { isActive: true } });
    const cat = await prisma.category.findFirst({ where: { isActive: true } });
    const sys = await prisma.relatedSystem.findFirst({ where: { isActive: true } });

    if (reqUser) activeRequesterId = reqUser.id;
    if (cat) activeCategoryId = cat.id;
    if (sys) activeSystemId = sys.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new ticket successfully with status 201 and generated ticket number', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({
        requesterId: activeRequesterId,
        categoryId: activeCategoryId,
        relatedSystemId: activeSystemId,
        requestedPriority: 'HIGH',
        summary: 'Laptop battery drains very quickly',
        description: 'My laptop battery drains in less than 30 minutes after Windows update.',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.ticketNumber).toMatch(/^TKT-2026-[A-Z0-9]{6}$/);
    expect(response.body.currentStatus).toBe('New');
    expect(response.body.summary).toBe('Laptop battery drains very quickly');
  });

  it('should return 400 Bad Request if summary is too short (< 5 chars)', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({
        requesterId: activeRequesterId,
        categoryId: activeCategoryId,
        relatedSystemId: activeSystemId,
        requestedPriority: 'MEDIUM',
        summary: 'Help',
        description: 'Detailed description about the problem here.',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Summary is required/);
  });

  it('should return 400 Bad Request if category ID is invalid', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({
        requesterId: activeRequesterId,
        categoryId: 99999,
        relatedSystemId: activeSystemId,
        requestedPriority: 'MEDIUM',
        summary: 'Valid ticket summary',
        description: 'Valid description with sufficient character length.',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Active Category not found');
  });
});
