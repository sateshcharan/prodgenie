/*
  Warnings:

  - You are about to drop the column `status` on the `File` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- AlterTable
ALTER TABLE "File" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "History" ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'pending';

-- DropEnum
DROP TYPE "FileStatus";
