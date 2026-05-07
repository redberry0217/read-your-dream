import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, '../data/tarot-metadata.json');
  const tarotData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log('Seeding tarot metadata...');

  for (const card of tarotData) {
    await prisma.tarotCard.upsert({
      where: { id: card.id },
      update: card,
      create: card,
    });
  }

  console.log(`Seeded ${tarotData.length} tarot cards.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
