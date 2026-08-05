-- AlterTable
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "country" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "B2BJob_country_idx" ON "B2BJob"("country");
