import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    const items = await prisma.menuItem.findMany();
    console.log('--- ALL MENU ITEMS ---');
    items.forEach(item => {
      console.log(`ID: ${item.id} | Name: "${item.name}" | Category: "${item.category}"`);
      console.log(`Price: ₹${item.price} | Enabled: ${item.enabled}`);
      console.log(`Image URL: "${item.image}"`);
      console.log('----------------------------------------');
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
