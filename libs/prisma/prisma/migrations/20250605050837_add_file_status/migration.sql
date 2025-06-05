-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "status" "FileStatus" NOT NULL DEFAULT 'pending';
