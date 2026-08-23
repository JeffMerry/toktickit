import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { generateTicketNumber } from './utils/ticketNumber';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TokTickIT API',
  });
});

// GET /api/requesters — ดึงเฉพาะ Active Development Requesters
app.get('/api/requesters', async (req, res) => {
  try {
    const requesters = await prisma.requesterUser.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
      },
    });
    res.json(requesters);
  } catch (error) {
    console.error('Error fetching requesters:', error);
    res.status(500).json({ error: 'Failed to fetch active requesters' });
  }
});

// GET /api/categories — ดึงเฉพาะ Active Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/related-systems — ดึงเฉพาะ Active Related Systems
app.get('/api/related-systems', async (req, res) => {
  try {
    const systems = await prisma.relatedSystem.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    res.json(systems);
  } catch (error) {
    console.error('Error fetching related systems:', error);
    res.status(500).json({ error: 'Failed to fetch related systems' });
  }
});

// POST /api/tickets — สร้างตั๋วใหม่ (Create Ticket Endpoint)
app.post('/api/tickets', async (req, res) => {
  try {
    const { requesterId, categoryId, relatedSystemId, requestedPriority, summary, description } = req.body;

    // 1. Validation: Requester ID
    const parsedRequesterId = Number(requesterId);
    if (!requesterId || isNaN(parsedRequesterId)) {
      return res.status(400).json({ error: 'Valid Requester ID is required' });
    }
    const requester = await prisma.requesterUser.findFirst({
      where: { id: parsedRequesterId, isActive: true },
    });
    if (!requester) {
      return res.status(400).json({ error: 'Active Requester not found' });
    }

    // 2. Validation: Category ID (BR-07)
    const parsedCategoryId = Number(categoryId);
    if (!categoryId || isNaN(parsedCategoryId)) {
      return res.status(400).json({ error: 'Valid Category ID is required' });
    }
    const category = await prisma.category.findFirst({
      where: { id: parsedCategoryId, isActive: true },
    });
    if (!category) {
      return res.status(400).json({ error: 'Active Category not found' });
    }

    // 3. Validation: Related System ID (BR-07)
    const parsedSystemId = Number(relatedSystemId);
    if (!relatedSystemId || isNaN(parsedSystemId)) {
      return res.status(400).json({ error: 'Valid Related System ID is required' });
    }
    const relatedSystem = await prisma.relatedSystem.findFirst({
      where: { id: parsedSystemId, isActive: true },
    });
    if (!relatedSystem) {
      return res.status(400).json({ error: 'Active Related System not found' });
    }

    // 4. Validation: Requested Priority (BR-08)
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const priorityUpper = requestedPriority ? String(requestedPriority).toUpperCase() : 'MEDIUM';
    if (!validPriorities.includes(priorityUpper)) {
      return res.status(400).json({ error: 'Requested Priority must be LOW, MEDIUM, HIGH, or URGENT' });
    }

    // 5. Validation: Summary (BR-05) - min 5, max 100
    const trimmedSummary = summary ? String(summary).trim() : '';
    if (!trimmedSummary || trimmedSummary.length < 5 || trimmedSummary.length > 100) {
      return res.status(400).json({ error: 'Summary is required and must be between 5 and 100 characters' });
    }

    // 6. Validation: Description (BR-06) - min 10, max 2000
    const trimmedDescription = description ? String(description).trim() : '';
    if (!trimmedDescription || trimmedDescription.length < 10 || trimmedDescription.length > 2000) {
      return res.status(400).json({ error: 'Description is required and must be between 10 and 2000 characters' });
    }

    // 7. Auto-generate official Ticket Number (BR-01) & Save Ticket (BR-02: Status = New)
    const ticketNumber = generateTicketNumber();

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        requesterId: parsedRequesterId,
        categoryId: parsedCategoryId,
        relatedSystemId: parsedSystemId,
        requestedPriority: priorityUpper,
        currentStatus: 'New',
        summary: trimmedSummary,
        description: trimmedDescription,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        relatedSystem: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create IT support ticket' });
  }
});

export default app;
