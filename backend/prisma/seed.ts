import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting University Attendance System database seed...');

  // 1. System Settings
  await prisma.systemSetting.upsert({
    where: { key: 'AUTO_APPROVE_STUDENTS' },
    update: {},
    create: {
      key: 'AUTO_APPROVE_STUDENTS',
      value: 'true',
      description: 'Automatically set first-time student registrations to ACTIVE status without admin approval',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'SYSTEM_NAME_KH' },
    update: {},
    create: {
      key: 'SYSTEM_NAME_KH',
      value: 'ប្រព័ន្ធគ្រប់គ្រងវត្តមានសាកលវិទ្យាល័យ',
      description: 'University Attendance System Khmer Title',
    },
  });

  // 2. Super Administrator
  const adminSalt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@ChangeMe2026!', adminSalt);

  const admin = await prisma.user.upsert({
    where: { identifier: 'ADMIN001' },
    update: {
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
    create: {
      identifier: 'ADMIN001',
      nameKh: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ',
      nameEn: 'System Administrator',
      category: 'ADMIN',
      role: 'SUPER_ADMIN',
      faculty: 'Information Technology',
      email: 'admin@university.edu.kh',
      phone: '+85512345678',
      passwordHash: adminPasswordHash,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Admin account seeded:', admin.identifier, admin.email);

  // 3. Active Locations
  const locations = [
    {
      code: 'LOC-GATE-01',
      nameKh: 'ច្រកទ្វារធំ',
      nameEn: 'Main Campus Gate',
      description: 'Main pedestrian and vehicular entrance',
      category: 'GATE',
      canCheckIn: true,
      canCheckOut: true,
      isActive: true,
      openTime: '06:00',
      closeTime: '22:00',
    },
    {
      code: 'LOC-LIB-01',
      nameKh: 'បណ្ណាល័យកណ្តាល',
      nameEn: 'Central Library',
      description: 'University Central Library & Study Commons',
      category: 'LIBRARY',
      canCheckIn: true,
      canCheckOut: true,
      isActive: true,
      openTime: '07:30',
      closeTime: '20:30',
    },
    {
      code: 'LOC-LAB-01',
      nameKh: 'បន្ទប់ពិសោធន៍កុំព្យូទ័រ A',
      nameEn: 'Computer Lab A',
      description: 'Building C, 2nd Floor, Lab A',
      category: 'LAB',
      canCheckIn: true,
      canCheckOut: true,
      isActive: true,
      openTime: '08:00',
      closeTime: '17:30',
    },
    {
      code: 'LOC-BLD-01',
      nameKh: 'អគារវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា (STEM)',
      nameEn: 'STEM Building Main Hall',
      description: 'Faculty of Science & Engineering lobby',
      category: 'BUILDING',
      canCheckIn: true,
      canCheckOut: true,
      isActive: true,
      openTime: '07:00',
      closeTime: '21:00',
    },
    {
      code: 'LOC-OLD-ARCHIVE',
      nameKh: 'អគារចាស់ ស្លាបខាងលិច (បិទដំណើរការ)',
      nameEn: 'Old Building West Wing (Deactivated)',
      description: 'Historic building under structural renovation',
      category: 'BUILDING',
      canCheckIn: false,
      canCheckOut: false,
      isActive: false,
      openTime: '08:00',
      closeTime: '17:00',
    },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { code: loc.code },
      update: loc,
      create: loc,
    });
  }
  console.log(`✅ Seeded ${locations.length} attendance locations.`);

  // 4. Sample Student and Teacher
  const student = await prisma.user.upsert({
    where: { identifier: 'STU2026001' },
    update: {},
    create: {
      identifier: 'STU2026001',
      nameKh: 'សុខ សុវណ្ណ',
      nameEn: 'Sok Sovann',
      category: 'STUDENT',
      role: 'STUDENT',
      faculty: 'Computer Science',
      major: 'Software Engineering',
      classGroup: 'Year 3 - Group B',
      email: 'sovann.sok@student.university.edu.kh',
      phone: '+85598765432',
      status: 'ACTIVE',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { identifier: 'TEA2026001' },
    update: {},
    create: {
      identifier: 'TEA2026001',
      nameKh: 'ចាន់ វិបុល',
      nameEn: 'Chan Vibol',
      category: 'TEACHER',
      role: 'TEACHER',
      faculty: 'Computer Science',
      email: 'vibol.chan@university.edu.kh',
      phone: '+85511223344',
      status: 'ACTIVE',
    },
  });

  const pendingStudent = await prisma.user.upsert({
    where: { identifier: 'STU2026002' },
    update: {},
    create: {
      identifier: 'STU2026002',
      nameKh: 'គឹម ស្រីនាង',
      nameEn: 'Kim Sreynang',
      category: 'STUDENT',
      role: 'STUDENT',
      faculty: 'Business Administration',
      major: 'Accounting',
      classGroup: 'Year 1 - Group A',
      email: 'sreynang.kim@student.university.edu.kh',
      phone: '+85577665544',
      status: 'PENDING_APPROVAL',
    },
  });

  console.log('✅ Seeded sample student, teacher, and pending student accounts.');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
