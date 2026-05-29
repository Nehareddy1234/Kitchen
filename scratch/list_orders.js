import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log('Orders in database:', orders);
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
