/*
  Warnings:

  - You are about to drop the column `createdat` on the `Reading` table. All the data in the column will be lost.
  - You are about to drop the column `updateedat` on the `Reading` table. All the data in the column will be lost.
  - You are about to drop the column `userid` on the `Reading` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,readingDate,slot]` on the table `Reading` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Reading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Reading` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `slot` on the `Reading` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SlotList" AS ENUM ('BEFOREBREAKFAST', 'AFTERBREAKFAST', 'AFTERLUNCH', 'AFTERDINNER');

-- DropForeignKey
ALTER TABLE "Reading" DROP CONSTRAINT "Reading_userid_fkey";

-- DropIndex
DROP INDEX "Reading_userid_readingDate_idx";

-- DropIndex
DROP INDEX "Reading_userid_readingDate_slot_key";

-- AlterTable
ALTER TABLE "Reading" DROP COLUMN "createdat",
DROP COLUMN "updateedat",
DROP COLUMN "userid",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "slot",
ADD COLUMN     "slot" "SlotList" NOT NULL;

-- CreateIndex
CREATE INDEX "Reading_userId_readingDate_idx" ON "Reading"("userId", "readingDate");

-- CreateIndex
CREATE UNIQUE INDEX "Reading_userId_readingDate_slot_key" ON "Reading"("userId", "readingDate", "slot");

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add constraints for reading value

ALTER TABLE "Reading" ADD CONSTRAINT "reading_value_range" CHECK ("value" BETWEEN 40 AND 600);
