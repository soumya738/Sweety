/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Reading" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "readingDate" DATE NOT NULL,
    "slot" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reading_userid_readingDate_idx" ON "Reading"("userid", "readingDate");

-- CreateIndex
CREATE UNIQUE INDEX "Reading_userid_readingDate_slot_key" ON "Reading"("userid", "readingDate", "slot");

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
