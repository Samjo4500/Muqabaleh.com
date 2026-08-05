-- AlterTable
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "careerLevel" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "B2BJob_careerLevel_idx" ON "B2BJob"("careerLevel");
CREATE INDEX IF NOT EXISTS "B2BJob_industry_idx" ON "B2BJob"("industry");
CREATE INDEX IF NOT EXISTS "B2BJob_employmentType_idx" ON "B2BJob"("employmentType");
