import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Database seed script
 * Creates initial admin user for development
 */
async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = 'admin@bauchicoop.local';
  const adminPassword = 'Admin@123456'; // Change this in production

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`✓ Admin user already exists: ${adminEmail}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SYSTEM_ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log(`✓ Admin user created successfully`);
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword} (CHANGE IN PRODUCTION)`);
    console.log(`  Role: SYSTEM_ADMIN`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✓ Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
