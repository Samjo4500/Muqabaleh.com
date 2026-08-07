-- Salary fields for listed jobs (only when ATS / JD publishes pay)
ALTER TABLE "ListedJob" ADD COLUMN IF NOT EXISTS "salaryMin" INTEGER;
ALTER TABLE "ListedJob" ADD COLUMN IF NOT EXISTS "salaryMax" INTEGER;
ALTER TABLE "ListedJob" ADD COLUMN IF NOT EXISTS "salaryCurrency" TEXT;
ALTER TABLE "ListedJob" ADD COLUMN IF NOT EXISTS "salaryInterval" TEXT;
ALTER TABLE "ListedJob" ADD COLUMN IF NOT EXISTS "salaryLabel" TEXT;

CREATE INDEX IF NOT EXISTS "ListedJob_salaryCurrency_salaryMin_idx" ON "ListedJob"("salaryCurrency", "salaryMin");
