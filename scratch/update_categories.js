import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Updating MenuItem categories...');
  const menuUpdate = await prisma.menuItem.updateMany({
    where: { category: 'Combos/Thali' },
    data: { category: 'Combos' },
  });
  console.log(`Updated ${menuUpdate.count} menu items.`);
}

main()
  .catch(err => {
    console.error('Error updating categories:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
