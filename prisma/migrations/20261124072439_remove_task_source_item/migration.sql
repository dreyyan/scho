/*
  Warnings:

  - You are about to drop the column `sourceItemId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_sourceItemId_fkey";

-- DropIndex
DROP INDEX "Task_sourceItemId_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "sourceItemId";
