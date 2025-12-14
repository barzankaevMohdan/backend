import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create SUPERADMIN
  const superAdminPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@system.com' },
    update: {},
    create: {
      email: 'admin@system.com',
      passwordHash: superAdminPassword,
      role: 'SUPERADMIN',
    },
  });
  console.log('✅ SuperAdmin created:', superAdmin.email);

  // Create demo company
  const demoCompany = await prisma.company.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company',
      slug: 'demo-company',
      isActive: true,
    },
  });
  console.log('✅ Demo company created:', demoCompany.name);

  // Create company admin
  const companyAdminPassword = await bcrypt.hash('admin123', 10);
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash: companyAdminPassword,
      role: 'COMPANY_ADMIN',
      companyId: demoCompany.id,
    },
  });
  console.log('✅ Company admin created:', companyAdmin.email);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      email: 'user@demo.com',
      passwordHash: userPassword,
      role: 'USER',
      companyId: demoCompany.id,
    },
  });
  console.log('✅ Regular user created:', user.email);

  console.log('\n📝 Credentials:');
  console.log('SuperAdmin: admin@system.com / admin123');
  console.log('Company Admin: admin@demo.com / admin123');
  console.log('User: user@demo.com / user123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });








