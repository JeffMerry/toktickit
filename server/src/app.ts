import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import type { Prisma, Priority, TicketStatus } from '@prisma/client';
import { generateTicketNumber } from './utils/ticketNumber';
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  readCookie,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  validatePassword,
  verifyPassword,
} from './utils/auth';

const app = express();
const prisma = new PrismaClient();
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

type SafeUser = {
  id: number;
  name: string;
  email: string;
  role: 'REQUESTER' | 'IT_STAFF' | 'ADMINISTRATOR';
  isActive: boolean;
  mustChangePassword: boolean;
};

type AuthenticatedRequest = Request & { auth?: { sessionId: number; user: SafeUser } };

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
} as const;

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS,
    path: '/',
  };
}

function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

function requireTrustedOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.get('origin');
  if (origin && origin !== clientOrigin) {
    return res.status(403).json({ error: 'Request origin is not allowed.' });
  }
  next();
}

async function requireAuthentication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const rawToken = readCookie(req.headers.cookie, SESSION_COOKIE_NAME);
  if (!rawToken) return res.status(401).json({ error: 'Authentication is required.' });

  try {
    const session = await prisma.session.findFirst({
      where: {
        tokenHash: hashSessionToken(rawToken),
        expiresAt: { gt: new Date() },
        user: { isActive: true },
      },
      select: { id: true, user: { select: safeUserSelect } },
    });
    if (!session) {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Authentication is required.' });
    }
    req.auth = { sessionId: session.id, user: session.user };
    next();
  } catch (error) {
    next(error);
  }
}

function requireRequester(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.auth) return res.status(401).json({ error: 'Authentication is required.' });
  if (req.auth.user.mustChangePassword) {
    return res.status(403).json({ error: 'Password change is required before accessing this resource.' });
  }
  if (req.auth.user.role !== 'REQUESTER') {
    return res.status(403).json({ error: 'Requester access is required.' });
  }
  next();
}

function rejectClientSuppliedRequesterId(req: Request, res: Response): boolean {
  const hasRequesterId = Object.prototype.hasOwnProperty.call(req.query || {}, 'requesterId')
    || Object.prototype.hasOwnProperty.call(req.body || {}, 'requesterId');
  if (!hasRequesterId) return false;
  res.status(400).json({ error: 'Client-supplied requesterId is not allowed.' });
  return true;
}

const legacyStatusMap: Record<string, TicketStatus> = {
  NEW: 'NEW',
  OPEN: 'OPEN',
  'IN PROGRESS': 'IN_PROGRESS',
  IN_PROGRESS: 'IN_PROGRESS',
  'WAITING FOR REQUESTER': 'WAITING_FOR_REQUESTER',
  WAITING_FOR_REQUESTER: 'WAITING_FOR_REQUESTER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
  CANCELLED: 'CANCELLED',
  CANCELED: 'CANCELLED',
};

function parseTicketStatus(value: string): TicketStatus | undefined {
  return legacyStatusMap[value.trim().toUpperCase()];
}

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

// Authentication endpoints
app.post('/api/auth/login', requireTrustedOrigin, async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { normalizedEmail: normalizeEmail(email) },
      select: { ...safeUserSelect, passwordHash: true },
    });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'This account is inactive.' });
    }

    const { rawToken, tokenHash } = createSessionToken();
    await prisma.session.create({
      data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
    });
    res.cookie(SESSION_COOKIE_NAME, rawToken, sessionCookieOptions());
    return res.json({ user: { ...user, passwordHash: undefined } });
  } catch (error) {
    console.error('Error signing in:', error);
    return res.status(500).json({ error: 'Unable to sign in.' });
  }
});

app.get('/api/auth/me', requireAuthentication, (req: AuthenticatedRequest, res) => {
  return res.json({ user: req.auth!.user });
});

app.post('/api/auth/change-password', requireTrustedOrigin, requireAuthentication, async (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    return res.status(400).json({ error: 'Current password, new password, and confirmation are required.' });
  }
  const passwordError = validatePassword(newPassword);
  if (passwordError || newPassword !== confirmPassword) {
    return res.status(400).json({ error: passwordError || 'Password confirmation does not match.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.user.id }, select: { passwordHash: true } });
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const { rawToken, tokenHash } = createSessionToken();
    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: req.auth!.user.id }, data: { passwordHash, mustChangePassword: false } }),
      prisma.session.deleteMany({ where: { userId: req.auth!.user.id } }),
      prisma.session.create({ data: { tokenHash, userId: req.auth!.user.id, expiresAt: new Date(Date.now() + SESSION_TTL_MS) } }),
    ]);
    const updatedUser = { ...req.auth!.user, mustChangePassword: false };
    res.cookie(SESSION_COOKIE_NAME, rawToken, sessionCookieOptions());
    return res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'Unable to change password.' });
  }
});

app.post('/api/auth/logout', requireTrustedOrigin, requireAuthentication, async (req: AuthenticatedRequest, res) => {
  try {
    await prisma.session.delete({ where: { id: req.auth!.sessionId } });
    clearSessionCookie(res);
    return res.json({ loggedOut: true });
  } catch (error) {
    console.error('Error signing out:', error);
    return res.status(500).json({ error: 'Unable to sign out.' });
  }
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploads statically
app.use('/uploads', express.static(uploadDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeBaseName}-${uniqueSuffix}${ext}`);
  },
});

// File Filter according to BR-09 (JPG, PNG, WEBP, PDF)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.txt')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed.'));
  }
};

// Multer Middleware for Attachments (Max 5MB per file, Max 5 files)
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB (BR-10)
  },
  fileFilter,
});

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
    const requesters = await prisma.user.findMany({
      where: { isActive: true, role: 'REQUESTER' },
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

// GET /api/tickets — ดึงรายการตั๋วของผู้แจ้งซ่อม (Ownership Isolation, Search, Filter, Sort, Pagination)
app.get('/api/tickets', requireAuthentication, requireRequester, async (req: AuthenticatedRequest, res) => {
  try {
    const { search, categoryId, priority, status, sortBy, sortOrder, page, limit } = req.query;
    if (rejectClientSuppliedRequesterId(req, res)) return;

    const where: Prisma.TicketWhereInput = {
      requesterId: req.auth!.user.id,
    };

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { ticketNumber: { contains: searchTerm, mode: 'insensitive' } },
        { summary: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (categoryId && !isNaN(Number(categoryId))) {
      where.categoryId = Number(categoryId);
    }

    if (priority && typeof priority === 'string' && priority.trim() !== '') {
      const parsedPriority = priority.trim().toUpperCase() as Priority;
      if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(parsedPriority)) {
        where.requestedPriority = parsedPriority;
      }
    }

    if (status && typeof status === 'string' && status.trim() !== '') {
      const parsedStatus = parseTicketStatus(status);
      if (parsedStatus) {
        where.currentStatus = parsedStatus;
      }
    }

    const validSortFields = ['createdAt', 'ticketNumber', 'requestedPriority', 'currentStatus', 'updatedAt'];
    const field = sortBy && validSortFields.includes(String(sortBy)) ? String(sortBy) : 'createdAt';
    const order = sortOrder && String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
    const orderBy = { [field]: order };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [tickets, totalCount] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          attachments: {
            where: { isRemoved: false },
            select: { id: true, fileName: true, fileSize: true, mimeType: true },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.json({
      data: tickets,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/:id — ดึงรายละเอียดตั๋วรายใบ (Ownership Check / BR-13)
app.get('/api/tickets/:id', requireAuthentication, requireRequester, async (req: AuthenticatedRequest, res) => {
  try {
    const ticketId = Number(req.params.id);

    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Valid ticket ID is required' });
    }
    if (rejectClientSuppliedRequesterId(req, res)) return;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        requester: { select: { id: true, name: true, email: true, department: true } },
        category: { select: { id: true, name: true, description: true } },
        relatedSystem: { select: { id: true, name: true, description: true } },
        attachments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // BR-13 Ownership Check: Strict access control
    if (ticket.requesterId !== req.auth!.user.id) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket detail:', error);
    res.status(500).json({ error: 'Failed to fetch ticket detail' });
  }
});

// POST /api/tickets — สร้างตั๋วใหม่พร้อมไฟล์แนบ
app.post('/api/tickets', requireTrustedOrigin, requireAuthentication, requireRequester, (req: AuthenticatedRequest, res) => {
  upload.array('attachments', 5)(req, res, async (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size exceeds 5 MB limit (BR-10)' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: 'Maximum 5 attachments allowed per ticket (BR-11)' });
        }
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }

    try {
      const { categoryId, relatedSystemId, requestedPriority, summary, description } = req.body;
      const files = (req.files as Express.Multer.File[]) || [];
      if (rejectClientSuppliedRequesterId(req, res)) {
        files.forEach((file) => fs.unlink(file.path, () => undefined));
        return;
      }

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

      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      const priorityUpper = requestedPriority ? String(requestedPriority).toUpperCase() : 'MEDIUM';
      if (!validPriorities.includes(priorityUpper)) {
        return res.status(400).json({ error: 'Requested Priority must be LOW, MEDIUM, HIGH, or URGENT' });
      }

      const trimmedSummary = summary ? String(summary).trim() : '';
      if (!trimmedSummary || trimmedSummary.length < 5 || trimmedSummary.length > 100) {
        return res.status(400).json({ error: 'Summary is required and must be between 5 and 100 characters' });
      }

      const trimmedDescription = description ? String(description).trim() : '';
      if (!trimmedDescription || trimmedDescription.length < 10 || trimmedDescription.length > 2000) {
        return res.status(400).json({ error: 'Description is required and must be between 10 and 2000 characters' });
      }

      const ticketNumber = generateTicketNumber();

      const newTicket = await prisma.ticket.create({
        data: {
          ticketNumber,
          requesterId: req.auth!.user.id,
          categoryId: parsedCategoryId,
          relatedSystemId: parsedSystemId,
          requestedPriority: priorityUpper as Priority,
          currentStatus: 'NEW',
          summary: trimmedSummary,
          description: trimmedDescription,
          attachments: {
            create: files.map((file) => ({
              fileName: file.originalname,
              fileSize: file.size,
              mimeType: file.mimetype,
              storagePath: `/uploads/${file.filename}`,
            })),
          },
        },
        include: {
          requester: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          attachments: true,
        },
      });

      res.status(201).json(newTicket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Failed to create IT support ticket' });
    }
  });
});

// POST /api/tickets/:id/attachments — อัปโหลดไฟล์แนบเพิ่มในตั๋วที่มีอยู่
app.post('/api/tickets/:id/attachments', requireTrustedOrigin, requireAuthentication, requireRequester, (req: AuthenticatedRequest, res) => {
  upload.array('attachments', 5)(req, res, async (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size exceeds 5 MB limit (BR-10)' });
        }
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }

    try {
      const ticketId = Number(req.params.id);
      const files = (req.files as Express.Multer.File[]) || [];

      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Valid ticket ID is required' });
      }

      // Check ticket existence
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { attachments: { where: { isRemoved: false } } },
      });

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      if (rejectClientSuppliedRequesterId(req, res)) {
        files.forEach((file) => fs.unlink(file.path, () => undefined));
        return;
      }

      // BR-13 Ownership Check: Strict ownership validation first
      if (ticket.requesterId !== req.auth!.user.id) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      if (files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // BR-11 Check: Max 5 active attachments limit
      const currentActiveCount = ticket.attachments.length;
      if (currentActiveCount + files.length > 5) {
        return res.status(400).json({
          error: `Maximum 5 active attachments allowed per ticket (BR-11). Current active: ${currentActiveCount}, Uploading: ${files.length}`,
        });
      }

      // Create Attachment records
      const createdAttachments = await Promise.all(
        files.map((file) =>
          prisma.attachment.create({
            data: {
              ticketId,
              fileName: file.originalname,
              fileSize: file.size,
              mimeType: file.mimetype,
              storagePath: `/uploads/${file.filename}`,
            },
          })
        )
      );

      res.status(201).json(createdAttachments);
    } catch (error) {
      console.error('Error uploading attachments:', error);
      res.status(500).json({ error: 'Failed to upload attachments' });
    }
  });
});

// GET /api/attachments/:id/download — ดาวน์โหลดไฟล์แนบ (BR-12 & BR-13 Check)
app.get('/api/attachments/:id/download', requireAuthentication, requireRequester, async (req: AuthenticatedRequest, res) => {
  try {
    const attachmentId = Number(req.params.id);

    if (isNaN(attachmentId)) {
      return res.status(400).json({ error: 'Valid attachment ID is required' });
    }
    if (rejectClientSuppliedRequesterId(req, res)) return;

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // BR-13 Ownership Check
    if (attachment.ticket.requesterId !== req.auth!.user.id) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // BR-12 Soft Removal Check: Block download for soft-removed files
    if (attachment.isRemoved) {
      return res.status(403).json({ error: 'Download Blocked: This attachment has been soft-removed.' });
    }

    const relativePath = attachment.storagePath.replace(/^\/uploads\//, '');
    const absolutePath = path.join(uploadDir, relativePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Physical file not found on server' });
    }

    res.download(absolutePath, attachment.fileName);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
});

// DELETE /api/attachments/:id — Soft-remove attachment with required reason (BR-12)
app.delete('/api/attachments/:id', requireTrustedOrigin, requireAuthentication, requireRequester, async (req: AuthenticatedRequest, res) => {
  try {
    const attachmentId = Number(req.params.id);
    const { removalReason } = req.body;

    if (isNaN(attachmentId)) {
      return res.status(400).json({ error: 'Valid attachment ID is required' });
    }

    if (rejectClientSuppliedRequesterId(req, res)) return;

    const trimmedReason = removalReason ? String(removalReason).trim() : '';
    if (!trimmedReason || trimmedReason.length < 3) {
      return res.status(400).json({ error: 'Removal reason is required and must be at least 3 characters (BR-12)' });
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // BR-13 Ownership Check
    if (attachment.ticket.requesterId !== req.auth!.user.id) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    if (attachment.isRemoved) {
      return res.status(400).json({ error: 'Attachment is already soft-removed' });
    }

    // BR-12 Soft Removal: update isRemoved, removedAt, removalReason
    const updatedAttachment = await prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        isRemoved: true,
        removedAt: new Date(),
        removalReason: trimmedReason,
      },
    });

    res.json(updatedAttachment);
  } catch (error) {
    console.error('Error soft-removing attachment:', error);
    res.status(500).json({ error: 'Failed to soft-remove attachment' });
  }
});

export default app;
