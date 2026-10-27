import { PrismaClient } from "@prisma/client";
try {
  const prisma = new PrismaClient();
  const count = await prisma.tarotCard.count();
  console.log("Prisma client initialized successfully. Tarot card count:", count);
  await prisma.$disconnect();
} catch (e) {
  console.error("Failed to initialize Prisma client:", e);
}
