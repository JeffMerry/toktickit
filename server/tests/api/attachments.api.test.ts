import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

describe('Ticket Detail & Attachment Lifecycle API Tests', () => {
  let requesterAId: number;
  let requesterBId: number;
  let ticketId: number;
  let attachmentId: number;

  beforeAll(async () => {
    // Fetch active requesters
    const activeRequesters = await prisma.requesterUser.findMany({
      where: { isActive: true },
      take: 2,
    });

    const category = await prisma.category.findFirst({ where: { isActive: true } });
    const system = await prisma.relatedSystem.findFirst({ where: { isActive: true } });

    if (activeRequesters.length < 2 || !category || !system) {
      throw new Error('Seed data missing for attachment testing.');
    }

    requesterAId = activeRequesters[0].id;
    requesterBId = activeRequesters[1].id;

    // Create a test ticket owned by Requester A
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-2026-ATTACH1',
        requesterId: requesterAId,
        categoryId: category.id,
        relatedSystemId: system.id,
        requestedPriority: 'HIGH',
        currentStatus: 'New',
        summary: 'Attachment testing ticket summary',
        description: 'Detailed description for testing attachment upload and soft removal.',
      },
    });
    ticketId = ticket.id;

    // Ensure sample upload file exists for physical file test
    const dummyFile = path.join(__dirname, 'dummy_test.txt');
    fs.writeFileSync(dummyFile, 'Sample attachment content for Vitest');

    // Create an initial attachment for testing download and soft removal
    const attachment = await prisma.attachment.create({
      data: {
        ticketId,
        fileName: 'test_doc.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        storagePath: '/uploads/test_doc.pdf',
      },
    });
    attachmentId = attachment.id;
  });

  afterAll(async () => {
    // Clean up created records
    await prisma.attachment.deleteMany({ where: { ticketId } });
    await prisma.ticket.delete({ where: { id: ticketId } });
    await prisma.$disconnect();

    const dummyFile = path.join(__dirname, 'dummy_test.txt');
    if (fs.existsSync(dummyFile)) {
      fs.unlinkSync(dummyFile);
    }
  });

  // 1. Ownership Protection Test (GET /api/tickets/:id)
  it('should return ticket details for owner (Requester A)', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .query({ requesterId: requesterAId });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ticketId);
    expect(res.body.ticketNumber).toBe('TKT-2026-ATTACH1');
  });

  it('should deny access (403) when Requester B attempts to view Requester A ticket', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .query({ requesterId: requesterBId });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Access Denied/);
  });

  // 2. Add Attachment Test (POST /api/tickets/:id/attachments)
  it('should deny attachment upload (403) for non-owner', async () => {
    const dummyFile = path.join(__dirname, 'dummy_test.txt');

    const res = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .field('requesterId', requesterBId)
      .attach('attachments', dummyFile);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Access Denied/);
  });

  // 3. Soft Removal Test (DELETE /api/attachments/:id)
  it('should soft-remove attachment with valid removal reason (BR-12)', async () => {
    const res = await request(app)
      .delete(`/api/attachments/${attachmentId}`)
      .send({
        requesterId: requesterAId,
        removalReason: 'File contains sensitive info by mistake',
      });

    expect(res.status).toBe(200);
    expect(res.body.isRemoved).toBe(true);
    expect(res.body.removalReason).toBe('File contains sensitive info by mistake');
  });

  // 4. Download Block Test (GET /api/attachments/:id/download)
  it('should block download (403) for soft-removed attachment (BR-12)', async () => {
    const res = await request(app)
      .get(`/api/attachments/${attachmentId}/download`)
      .query({ requesterId: requesterAId });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Download Blocked/);
  });

  it('should deny attachment download (403) for non-owner', async () => {
    const res = await request(app)
      .get(`/api/attachments/${attachmentId}/download`)
      .query({ requesterId: requesterBId });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Access Denied/);
  });
});
