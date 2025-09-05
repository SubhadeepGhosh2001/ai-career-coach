/*
  Warnings:

  - You are about to drop the column `expericence` on the `User` table. All the data in the column will be lost.
  - Changed the type of `demandLevel` on the `IndustryInsight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `marketOutlook` on the `IndustryInsight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "public"."Resume_userId_idx";

-- AlterTable
ALTER TABLE "public"."IndustryInsight" DROP COLUMN "demandLevel",
ADD COLUMN     "demandLevel" TEXT NOT NULL,
DROP COLUMN "marketOutlook",
ADD COLUMN     "marketOutlook" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "expericence",
ADD COLUMN     "experience" INTEGER;
