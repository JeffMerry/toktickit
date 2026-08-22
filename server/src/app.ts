import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

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

export default app;
