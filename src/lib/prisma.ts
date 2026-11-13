import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string is not defined");
}

// Configure the PostgreSQL driver adapter using the database connection string.
const adapter = new PrismaPg({
  connectionString,
});

/**
 * Shared Prisma Client instance for interacting with the PostgreSQL database.
 * 
 * Provides type-safe database operations for the application's models.
 */
export const prisma = new PrismaClient({ adapter });