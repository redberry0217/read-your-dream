import { PrismaClient } from "@prisma/client";
try {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
  });
  console.log("Prisma client initialized successfully");
} catch (e) {
  console.error("Failed to initialize Prisma client:", e);
}
