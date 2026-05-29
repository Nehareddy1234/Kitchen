import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });
  if (orders.length > 0) {
    const spreadOrder = { ...orders[0] };
    console.log('Original order:', orders[0]);
    console.log('Spread order:', spreadOrder);
    console.log('Has orderNumber in spread:', 'orderNumber' in spreadOrder);
  } else {
    console.log('No orders found');
  }
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
