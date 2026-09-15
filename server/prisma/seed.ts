import {
  PrismaClient,
  Priority,
  TicketStatus,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Lab 3 seeding...');
  // Development-only password: ChangeMe123! (users must change it on first login)
  const defaultPasswordHash = await bcrypt.hash('ChangeMe123!', 12);

  const categories = [
    { name: 'Account and Access', description: 'User accounts, permissions, and system access requests' },
    { name: 'Hardware', description: 'Physical equipment issues (Laptop, Printer, Monitor, etc.)' },
    { name: 'Software', description: 'Application bugs, installation requests, and OS issues' },
    { name: 'Network', description: 'Wi-Fi, VPN, and network connection problems' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { description: category.description, isActive: true },
      create: { ...category, isActive: true },
    });
  }

  const relatedSystems = [
    { name: 'Email', description: 'KMUTT Webmail & Exchange System' },
    { name: 'Campus Wi-Fi', description: 'KMUTT Secure & Guest Wireless Network' },
    { name: 'VPN', description: 'Remote Access VPN Connection' },
    { name: 'LEB2 App', description: 'Learning Environment System' },
    { name: 'Grade Submission App', description: 'Academic Grading Portal' },
    { name: 'Printer', description: 'Departmental Printers & Scanners' },
    { name: 'Corporate Laptop', description: 'University Issued Laptops & Workstations' },
  ];

  for (const system of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name: system.name },
      update: { description: system.description, isActive: true },
      create: { ...system, isActive: true },
    });
  }

  const users = [
    { name: 'Jennifer Anderson', email: 'jennifer.anderson@kmutt.ac.th', department: 'Computer Engineering', role: UserRole.REQUESTER, isActive: true },
    { name: 'Michael Brown', email: 'michael.brown@kmutt.ac.th', department: 'IT Support', role: UserRole.REQUESTER, isActive: true },
    { name: 'Sarah Johnson', email: 'sarah.johnson@kmutt.ac.th', department: 'Academic Affairs', role: UserRole.REQUESTER, isActive: true },
    { name: 'David Lee', email: 'david.lee@kmutt.ac.th', department: 'Student Records', role: UserRole.REQUESTER, isActive: true },
    { name: 'Inactive User', email: 'inactive.user@kmutt.ac.th', department: 'Former Staff', role: UserRole.REQUESTER, isActive: false },
    { name: 'Mary Support', email: 'mary.support@kmutt.ac.th', department: 'IT Support', role: UserRole.IT_STAFF, isActive: true },
    { name: 'Somchai Technician', email: 'somchai.technician@kmutt.ac.th', department: 'IT Support', role: UserRole.IT_STAFF, isActive: true },
    { name: 'Niran Engineer', email: 'niran.engineer@kmutt.ac.th', department: 'IT Support', role: UserRole.IT_STAFF, isActive: true },
    { name: 'Inactive Technician', email: 'inactive.technician@kmutt.ac.th', department: 'IT Support', role: UserRole.IT_STAFF, isActive: false },
    { name: 'Admin User', email: 'admin@kmutt.ac.th', department: 'IT Administration', role: UserRole.ADMINISTRATOR, isActive: true },
  ];

  const usersByEmail = new Map<string, { id: number }>();
  for (const user of users) {
    const normalizedEmail = user.email.toLowerCase();
    const savedUser = await prisma.user.upsert({
      where: { normalizedEmail },
      update: {
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        isActive: user.isActive,
        passwordHash: defaultPasswordHash,
        mustChangePassword: true,
      },
      create: {
        ...user,
        normalizedEmail,
        passwordHash: defaultPasswordHash,
        mustChangePassword: true,
      },
      select: { id: true },
    });
    usersByEmail.set(user.email, savedUser);
  }

  const categoriesByName = new Map(
    (await prisma.category.findMany()).map((category) => [category.name, category])
  );
  const systemsByName = new Map(
    (await prisma.relatedSystem.findMany()).map((system) => [system.name, system])
  );
  const getUserId = (email: string) => usersByEmail.get(email)!.id;
  const getOptionalUserId = (email?: string) => (email ? getUserId(email) : null);
  const getCategoryId = (name: string) => categoriesByName.get(name)!.id;
  const getSystemId = (name: string) => systemsByName.get(name)!.id;

  const tickets = [
    { ticketNumber: 'TKT-2026-SEED-001', requesterEmail: 'jennifer.anderson@kmutt.ac.th', category: 'Hardware', system: 'Corporate Laptop', requestedPriority: Priority.LOW, itPriority: Priority.MEDIUM, currentStatus: TicketStatus.NEW, summary: 'Laptop keyboard key is loose', description: 'The Enter key is loose and sometimes does not register input.' },
    { ticketNumber: 'TKT-2026-SEED-002', requesterEmail: 'michael.brown@kmutt.ac.th', ownerEmail: 'somchai.technician@kmutt.ac.th', category: 'Network', system: 'VPN', requestedPriority: Priority.MEDIUM, itPriority: Priority.HIGH, currentStatus: TicketStatus.OPEN, summary: 'VPN disconnects every few minutes', description: 'The VPN connection drops repeatedly while working remotely.' },
    { ticketNumber: 'TKT-2026-SEED-003', requesterEmail: 'sarah.johnson@kmutt.ac.th', ownerEmail: 'niran.engineer@kmutt.ac.th', category: 'Software', system: 'Grade Submission App', requestedPriority: Priority.HIGH, itPriority: Priority.URGENT, currentStatus: TicketStatus.IN_PROGRESS, summary: 'Grade submission page cannot save', description: 'Saving a completed grade form returns an unexpected server error.' },
    { ticketNumber: 'TKT-2026-SEED-004', requesterEmail: 'david.lee@kmutt.ac.th', ownerEmail: 'somchai.technician@kmutt.ac.th', category: 'Account and Access', system: 'Email', requestedPriority: Priority.URGENT, itPriority: Priority.URGENT, currentStatus: TicketStatus.WAITING_FOR_REQUESTER, summary: 'Email account is locked', description: 'The account is locked after a password reset and cannot receive mail.', requesterResolvedAt: new Date('2026-09-02T09:00:00.000Z') },
    { ticketNumber: 'TKT-2026-SEED-005', requesterEmail: 'jennifer.anderson@kmutt.ac.th', ownerEmail: 'mary.support@kmutt.ac.th', category: 'Hardware', system: 'Printer', requestedPriority: Priority.MEDIUM, itPriority: Priority.MEDIUM, currentStatus: TicketStatus.RESOLVED, summary: 'Printer prints blank pages', description: 'The departmental printer accepts jobs but prints only blank pages.', resolutionSuggestedByEmail: 'mary.support@kmutt.ac.th' },
    { ticketNumber: 'TKT-2026-SEED-006', requesterEmail: 'michael.brown@kmutt.ac.th', ownerEmail: 'niran.engineer@kmutt.ac.th', category: 'Network', system: 'Campus Wi-Fi', requestedPriority: Priority.LOW, itPriority: Priority.LOW, currentStatus: TicketStatus.CLOSED, summary: 'Wi-Fi signal is weak in meeting room', description: 'The campus Wi-Fi signal is consistently weak in the second-floor meeting room.', resolutionSuggestedByEmail: 'niran.engineer@kmutt.ac.th' },
    { ticketNumber: 'TKT-2026-SEED-007', requesterEmail: 'sarah.johnson@kmutt.ac.th', ownerEmail: 'mary.support@kmutt.ac.th', category: 'Software', system: 'LEB2 App', requestedPriority: Priority.HIGH, itPriority: Priority.HIGH, currentStatus: TicketStatus.REOPENED, summary: 'Learning app error returned again', description: 'The previously resolved application error has returned after the latest update.' },
    { ticketNumber: 'TKT-2026-SEED-008', requesterEmail: 'david.lee@kmutt.ac.th', ownerEmail: 'somchai.technician@kmutt.ac.th', category: 'Account and Access', system: 'Email', requestedPriority: Priority.MEDIUM, itPriority: Priority.MEDIUM, currentStatus: TicketStatus.CANCELLED, summary: 'Request for temporary mailbox', description: 'The requester no longer needs the temporary mailbox that was requested.' },
  ];

  const seededTickets = [];
  for (const ticket of tickets) {
    const savedTicket = await prisma.ticket.upsert({
      where: { ticketNumber: ticket.ticketNumber },
      update: {
        requesterId: getUserId(ticket.requesterEmail),
        ownerId: getOptionalUserId(ticket.ownerEmail),
        categoryId: getCategoryId(ticket.category),
        relatedSystemId: getSystemId(ticket.system),
        requestedPriority: ticket.requestedPriority,
        itPriority: ticket.itPriority,
        currentStatus: ticket.currentStatus,
        requesterResolvedAt: ticket.requesterResolvedAt ?? null,
        summary: ticket.summary,
        description: ticket.description,
        resolutionSuggestedAt: ticket.resolutionSuggestedByEmail ? new Date('2026-09-01T09:00:00.000Z') : null,
        resolutionSuggestedById: ticket.resolutionSuggestedByEmail ? getUserId(ticket.resolutionSuggestedByEmail) : null,
      },
      create: {
        ticketNumber: ticket.ticketNumber,
        requesterId: getUserId(ticket.requesterEmail),
        ownerId: getOptionalUserId(ticket.ownerEmail),
        categoryId: getCategoryId(ticket.category),
        relatedSystemId: getSystemId(ticket.system),
        requestedPriority: ticket.requestedPriority,
        itPriority: ticket.itPriority,
        currentStatus: ticket.currentStatus,
        requesterResolvedAt: ticket.requesterResolvedAt ?? null,
        summary: ticket.summary,
        description: ticket.description,
        resolutionSuggestedAt: ticket.resolutionSuggestedByEmail ? new Date('2026-09-01T09:00:00.000Z') : null,
        resolutionSuggestedById: ticket.resolutionSuggestedByEmail ? getUserId(ticket.resolutionSuggestedByEmail) : null,
      },
      select: { id: true, ticketNumber: true },
    });
    seededTickets.push(savedTicket);
  }

  const ticketIdByNumber = new Map(seededTickets.map((ticket) => [ticket.ticketNumber, ticket.id]));
  const seededTicketIds = seededTickets.map((ticket) => ticket.id);
  await prisma.publicComment.deleteMany({ where: { ticketId: { in: seededTicketIds } } });
  await prisma.internalNote.deleteMany({ where: { ticketId: { in: seededTicketIds } } });

  await prisma.publicComment.createMany({
    data: [
      { ticketId: ticketIdByNumber.get('TKT-2026-SEED-003')!, authorId: getUserId('niran.engineer@kmutt.ac.th'), content: 'We have reproduced the saving error and are investigating the service logs.' },
      { ticketId: ticketIdByNumber.get('TKT-2026-SEED-004')!, authorId: getUserId('somchai.technician@kmutt.ac.th'), content: 'Please confirm the most recent time you could successfully sign in.' },
      { ticketId: ticketIdByNumber.get('TKT-2026-SEED-005')!, authorId: getUserId('mary.support@kmutt.ac.th'), content: 'The toner cartridge was replaced and a test page now prints correctly.' },
    ],
  });

  await prisma.internalNote.createMany({
    data: [
      { ticketId: ticketIdByNumber.get('TKT-2026-SEED-003')!, authorId: getUserId('niran.engineer@kmutt.ac.th'), content: 'Observed a database validation error from the grade-submission service.' },
      { ticketId: ticketIdByNumber.get('TKT-2026-SEED-004')!, authorId: getUserId('somchai.technician@kmutt.ac.th'), content: 'Account lockout investigation is pending requester confirmation.' },
      { ticketId: ticketIdByNumber.get('TKT-2026-SEED-005')!, authorId: getUserId('mary.support@kmutt.ac.th'), content: 'Resolution is ready for requester confirmation before closing.' },
    ],
  });

  console.log('Lab 3 seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
