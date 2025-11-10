-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "inviteCodeCode" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_inviteCodeCode_fkey" FOREIGN KEY ("inviteCodeCode") REFERENCES "InviteCode"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_usedBy_fkey" FOREIGN KEY ("usedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
