import { beforeAll, afterAll } from 'vitest';
import prisma from '../src/prisma';
import bcrypt from 'bcryptjs';

beforeAll(async () => {
  // Clear any existing test attendance events, sessions, test users, and test locations
  await prisma.attendanceEvent.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.location.deleteMany({
    where: {
      code: 'LOC-NEW-AUDITORIUM',
    },
  });
  await prisma.user.deleteMany({
    where: {
      identifier: {
        not: 'ADMIN001',
      },
    },
  });

  // Upsert test locations
  const testLocations = [
    {
      code: 'LOC-TEST-GATE',
      nameKh: 'ច្រកទ្វារសាកល្បង',
      nameEn: 'Test Gate',
      category: 'GATE',
      canCheckIn: true,
      canCheckOut: true,
      isActive: true,
    },
    {
      code: 'LOC-TEST-LAB',
      nameKh: 'បន្ទប់ពិសោធន៍សាកល្បង',
      nameEn: 'Test Computer Lab',
      category: 'LAB',
      canCheckIn: true,
      canCheckOut: false, // Check-in only
      isActive: true,
    },
    {
      code: 'LOC-TEST-INACTIVE',
      nameKh: 'ទីតាំងអសកម្ម',
      nameEn: 'Inactive Location',
      category: 'BUILDING',
      canCheckIn: true,
      canCheckOut: true,
      isActive: false, // Inactive
    },
  ];

  for (const loc of testLocations) {
    await prisma.location.upsert({
      where: { code: loc.code },
      update: loc,
      create: loc,
    });
  }

  // Upsert Admin user for tests
  const adminSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('TestAdminPass123!', adminSalt);

  await prisma.user.upsert({
    where: { identifier: 'ADMIN999' },
    update: {
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
    create: {
      identifier: 'ADMIN999',
      nameKh: 'អ្នកគ្រប់គ្រងតេស្ត',
      nameEn: 'Test Administrator',
      category: 'ADMIN',
      role: 'SUPER_ADMIN',
      faculty: 'IT',
      email: 'admin.test@university.edu.kh',
      passwordHash: adminHash,
      status: 'ACTIVE',
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
