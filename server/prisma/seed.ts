import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Lab 2 Seeding...');

  // 1. Seed Categories (4 รายการบังคับ)
  const categories = [
    { name: 'Account and Access', description: 'User accounts, permissions, and system access requests' },
    { name: 'Hardware', description: 'Physical equipment issues (Laptop, Printer, Monitor, etc.)' },
    { name: 'Software', description: 'Application bugs, installation requests, and OS issues' },
    { name: 'Network', description: 'Wi-Fi, VPN, and network connection problems' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description, isActive: true },
      create: { name: cat.name, description: cat.description, isActive: true },
    });
  }
  console.log('✅ Categories seeded.');

  // 2. Seed Related Systems (อย่างน้อย 6 รายการ)
  const relatedSystems = [
    { name: 'Email', description: 'KMUTT Webmail & Exchange System' },
    { name: 'Campus Wi-Fi', description: 'KMUTT Secure & Guest Wireless Network' },
    { name: 'VPN', description: 'Remote Access VPN Connection' },
    { name: 'LEB2 App', description: 'Learning Environment System' },
    { name: 'Grade Submission App', description: 'Academic Grading Portal' },
    { name: 'Printer', description: 'Departmental Printers & Scanners' },
    { name: 'Corporate Laptop', description: 'University Issued Laptops & Workstations' },
  ];

  for (const sys of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name: sys.name },
      update: { description: sys.description, isActive: true },
      create: { name: sys.name, description: sys.description, isActive: true },
    });
  }
  console.log('✅ Related Systems seeded.');

  // 3. Seed Development Requesters (4 Active + 1 Inactive)
  const requesters = [
    { name: 'Jennifer Anderson', email: 'jennifer.anderson@kmutt.ac.th', department: 'Computer Engineering', isActive: true },
    { name: 'Michael Brown', email: 'michael.brown@kmutt.ac.th', department: 'IT Support', isActive: true },
    { name: 'Sarah Johnson', email: 'sarah.johnson@kmutt.ac.th', department: 'Academic Affairs', isActive: true },
    { name: 'David Lee', email: 'david.lee@kmutt.ac.th', department: 'Student Records', isActive: true },
    { name: 'Inactive User', email: 'inactive.user@kmutt.ac.th', department: 'Former Staff', isActive: false },
  ];

  for (const req of requesters) {
    await prisma.requesterUser.upsert({
      where: { email: req.email },
      update: { name: req.name, department: req.department, isActive: req.isActive },
      create: { name: req.name, email: req.email, department: req.department, isActive: req.isActive },
    });
  }
  console.log('✅ Development Requesters seeded.');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
