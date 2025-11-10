/*
  Warnings:

  - You are about to drop the `JobOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductTemplate` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `File` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'OWNER', 'USER');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('DRAWING', 'TEMPLATE', 'SEQUENCE', 'JOB_CARD');

-- AlterTable
ALTER TABLE "File" DROP COLUMN "type",
ADD COLUMN     "type" "FileType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" "UserType" NOT NULL;

-- DropTable
DROP TABLE "JobOrder";

-- DropTable
DROP TABLE "ProductTemplate";
