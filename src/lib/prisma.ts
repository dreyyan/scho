import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Configure the PostgreSQL driver adapter using the database connection string.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

/**
 * Shared Prisma Client instance for interacting with the PostgreSQL database.
 * 
 * Provides type-safe database operations for the application's models.
 */
export const prisma = new PrismaClient({ adapter });