/*
  Warnings:

  - You are about to drop the `IndustryInsights` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_industry_fkey";

-- DropTable
DROP TABLE "public"."IndustryInsights";

-- CreateTable
CREATE TABLE "public"."IndustryInsight" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "salaryRanges" JSONB[],
    "growthRate" DOUBLE PRECISION NOT NULL,
    "demandLevel" "public"."DemandLevel" NOT NULL,
    "topSkills" TEXT[],
    "marketOutlook" "public"."MarketOutlook" NOT NULL,
    "keyTrends" TEXT[],
    "recommendedSkills" TEXT[],
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndustryInsight_industry_key" ON "public"."IndustryInsight"("industry");

-- CreateIndex
CREATE INDEX "IndustryInsight_industry_idx" ON "public"."IndustryInsight"("industry");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_industry_fkey" FOREIGN KEY ("industry") REFERENCES "public"."IndustryInsight"("industry") ON DELETE SET NULL ON UPDATE CASCADE;
