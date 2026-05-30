// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed profiles
  await prisma.profile.createMany({
    data: [
      { id: 'admin-id', email: 'admin@example.com', role: 'admin' },
      { id: 'manager-id', email: 'manager@example.com', role: 'account_manager' },
      { id: 'waiter-id', email: 'waiter@example.com', role: 'waiter' },
      { id: 'cust1-id', email: 'customer1@example.com', role: 'customer' },
      { id: 'cust2-id', email: 'customer2@example.com', role: 'customer' },
    ],
    skipDuplicates: true,
  });

  // Seed tables
  await prisma.table.createMany({
    data: [
      { id: 1, name: 'T1', capacity: 4, status: 'available' },
      { id: 2, name: 'T2', capacity: 2, status: 'available' },
      { id: 3, name: 'T3', capacity: 6, status: 'available' },
      { id: 4, name: 'T4', capacity: 4, status: 'available' },
      { id: 5, name: 'T5', capacity: 4, status: 'available' },
      { id: 6, name: 'T6', capacity: 6, status: 'available' },
      { id: 7, name: 'T7', capacity: 2, status: 'available' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
