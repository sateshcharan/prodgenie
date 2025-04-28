/*
  Warnings:

  - The values [DRAWING,TEMPLATE,SEQUENCE,JOB_CARD] on the enum `FileType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Sequence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Template` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FileType_new" AS ENUM ('drawing', 'template', 'sequence', 'jobCard');
ALTER TABLE "File" ALTER COLUMN "type" TYPE "FileType_new" USING ("type"::text::"FileType_new");
ALTER TYPE "FileType" RENAME TO "FileType_old";
ALTER TYPE "FileType_new" RENAME TO "FileType";
DROP TYPE "FileType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Sequence" DROP CONSTRAINT "Sequence_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Sequence" DROP CONSTRAINT "Sequence_userId_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_userId_fkey";

-- DropTable
DROP TABLE "Sequence";

-- DropTable
DROP TABLE "Template";
