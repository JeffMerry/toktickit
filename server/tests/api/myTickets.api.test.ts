import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('GET /api/tickets API (My Tickets List)', () => {
  let requesterAId: number;
  let requesterBId: number;
  let categoryId: number;
  let systemId: number;

  beforeAll(async () => {
    // Fetch active seeded requesters
    const activeRequesters = await prisma.requesterUser.findMany({
      where: { isActive: true },
      take: 2,
    });

    const category = await prisma.category.findFirst({ where: { isActive: true } });
    const system = await prisma.relatedSystem.findFirst({ where: { isActive: true } });

    if (activeRequesters.length < 2 || !category || !system) {
      throw new Error('Seed data required for testing my-tickets endpoint is missing.');
    }

    requesterAId = activeRequesters[0].id;
    requesterBId = activeRequesters[1].id;
    categoryId = category.id;
    systemId = system.id;

    // Create distinct tickets for Requester A
    await prisma.ticket.createMany({
      data: [
        {
          ticketNumber: 'TKT-2026-TESTA1',
          requesterId: requesterAId,
          categoryId,
          relatedSystemId: systemId,
          requestedPriority: 'HIGH',
          currentStatus: 'New',
          summary: 'Laptop screen flickering issue',
          description: 'The laptop display flickers randomly when using browser.',
        },
        {
          ticketNumber: 'TKT-2026-TESTA2',
          requesterId: requesterAId,
          categoryId,
          relatedSystemId: systemId,
          requestedPriority: 'LOW',
          currentStatus: 'New',
          summary: 'Printer paper jam in department',
          description: 'Departmental printer fails to feed A4 paper properly.',
        },
      ],
    });

    // Create distinct ticket for Requester B
    await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-2026-TESTB1',
        requesterId: requesterBId,
        categoryId,
        relatedSystemId: systemId,
        requestedPriority: 'URGENT',
        currentStatus: 'New',
        summary: 'VPN access denied for remote user',
        description: 'Unable to connect to campus network via Cisco VPN client.',
      },
    });
  });

  afterAll(async () => {
    // Clean up created test tickets
    await prisma.ticket.deleteMany({
      where: {
        ticketNumber: {
          in: ['TKT-2026-TESTA1', 'TKT-2026-TESTA2', 'TKT-2026-TESTB1'],
        },
      },
    });
    await prisma.$disconnect();
  });

  it('should return 400 Bad Request if requesterId parameter is missing', async () => {
    const response = await request(app).get('/api/tickets');
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/requesterId parameter is required/);
  });

  it('should strictly isolate tickets and return only tickets owned by Requester A', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .query({ requesterId: requesterAId });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');

    const ticketNumbers: string[] = response.body.data.map((t: any) => t.ticketNumber);
    expect(ticketNumbers).toContain('TKT-2026-TESTA1');
    expect(ticketNumbers).toContain('TKT-2026-TESTA2');
    expect(ticketNumbers).not.toContain('TKT-2026-TESTB1');
  });

  it('should filter tickets by search query term', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .query({ requesterId: requesterAId, search: 'flickering' });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].ticketNumber).toBe('TKT-2026-TESTA1');
  });

  it('should filter tickets by requested priority', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .query({ requesterId: requesterAId, priority: 'HIGH' });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data.every((t: any) => t.requestedPriority === 'HIGH')).toBe(true);
  });

  it('should correctly format pagination metadata', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .query({ requesterId: requesterAId, page: 1, limit: 1 });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(1);
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
  });
});
