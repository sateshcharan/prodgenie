/*
  Warnings:

  - Added the required column `config` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creditsUsed` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobCardNumber` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InviteCode" DROP CONSTRAINT "InviteCode_usedBy_fkey";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "config" JSONB NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creditsUsed" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fileId" TEXT NOT NULL,
ADD COLUMN     "jobCardNumber" INTEGER NOT NULL,
ADD COLUMN     "jobStatus" "JobStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Org" ADD COLUMN     "credits" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "InviteCode"("usedBy") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
