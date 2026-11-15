import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

async function main() {
  const users = await prisma.user.findMany();

  logger.info("Databse connection successful");
  logger.info(`Users: ${users}`);
}

main()
  .catch((err: unknown) => {
    logger.error("Database connection failed", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
