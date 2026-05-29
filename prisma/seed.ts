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
    ],
    skipDuplicates: true,
  });

  // Seed menu items
  await prisma.menuItem.createMany({
    data: [
      { id: 1, name: 'Deluxe Veg Thali', category: 'Combos', price: 250, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200&h=200', enabled: true },
      { id: 2, name: 'Paneer Butter Masala', category: 'Curries', price: 180, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200&h=200', enabled: true },
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
