import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

vi.mock('@prisma/client', () => {
  const mockFindMany = vi.fn().mockResolvedValue([
    { id: 1, name: 'Account and Access' },
    { id: 2, name: 'Hardware' },
    { id: 3, name: 'Software' },
    { id: 4, name: 'Network' },
  ]);

  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      category: {
        findMany: mockFindMany,
      },
    })),
  };
});

describe('GET /api/categories', () => {
  it('should return 200 OK and the seeded categories', async () => {
    const response = await request(app).get('/api/categories');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 1, name: 'Account and Access' },
      { id: 2, name: 'Hardware' },
      { id: 3, name: 'Software' },
      { id: 4, name: 'Network' },
    ]);
  });
});
