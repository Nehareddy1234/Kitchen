import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching orders without orderNumber...');
  // Use raw SQL because orderNumber is non-nullable; raw query can find NULL values
  const orders = await prisma.$queryRaw`SELECT id, "createdAt" FROM "Order" WHERE "orderNumber" IS NULL ORDER BY "createdAt" ASC`;

  if (orders.length === 0) {
    console.log('All orders already have orderNumber.');
    return;
  }

  // Determine next orderNumber based on current max
  const maxObj = await prisma.order.findFirst({
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  });
  let next = (maxObj?.orderNumber ?? 0) + 1;

  for (const order of orders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { orderNumber: next },
    });
    console.log(`Updated order ${order.id} => orderNumber ${next}`);
    next++;
  }

  console.log('Backfill complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
