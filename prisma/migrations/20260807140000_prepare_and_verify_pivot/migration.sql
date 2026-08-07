-- Prepare-and-Verify pivot: hard-delete apply-on-behalf; add public job board + manual tracker.

-- Drop apply-on-behalf tables (order matters for FKs)
DROP TABLE IF EXISTS "JeannieOpportunity" CASCADE;
DROP TABLE IF EXISTS "JeannieJobListing" CASCADE;
DROP TABLE IF EXISTS "JeannieSlaPeriod" CASCADE;

-- Drop apply enums
DROP TYPE IF EXISTS "JeannieOpportunityStatus";
DROP TYPE IF EXISTS "JeannieSlaStatus";

-- Drop apply quota columns; add mastery pack credits
ALTER TABLE "User" DROP COLUMN IF EXISTS "appliesLeft";
ALTER TABLE "User" DROP COLUMN IF EXISTS "appliesResetAt";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "masteryMocksLeft" INTEGER NOT NULL DEFAULT 0;

-- Extend UserTier with Mastery Pack
ALTER TYPE "UserTier" ADD VALUE IF NOT EXISTS 'MASTERY_PACK';

-- New enums
DO $$ BEGIN
  CREATE TYPE "ListedJobSource" AS ENUM ('EMPLOYER_POSTED', 'GREENHOUSE', 'LEVER', 'WORKABLE', 'RECRUITEE', 'ASHBY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ManualApplicationStatus" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "JobMockType" AS ENUM ('COMPANY_SPECIFIC', 'BEHAVIORAL', 'TECHNICAL', 'GENERAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ListedCompany
CREATE TABLE IF NOT EXISTS "ListedCompany" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "ats" TEXT,
  "country" TEXT NOT NULL,
  "industry" TEXT,
  "logoUrl" TEXT,
  "website" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ListedCompany_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ListedCompany_slug_key" ON "ListedCompany"("slug");
CREATE INDEX IF NOT EXISTS "ListedCompany_isActive_country_idx" ON "ListedCompany"("isActive", "country");
CREATE INDEX IF NOT EXISTS "ListedCompany_ats_idx" ON "ListedCompany"("ats");

-- ListedJob
CREATE TABLE IF NOT EXISTS "ListedJob" (
  "id" TEXT NOT NULL,
  "companyId" TEXT,
  "externalId" TEXT,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "department" TEXT,
  "employmentType" TEXT,
  "description" TEXT NOT NULL,
  "requirements" TEXT,
  "applyUrl" TEXT NOT NULL,
  "source" "ListedJobSource" NOT NULL DEFAULT 'EMPLOYER_POSTED',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fetchedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ListedJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ListedJob_companyId_externalId_key" ON "ListedJob"("companyId", "externalId");
CREATE UNIQUE INDEX IF NOT EXISTS "ListedJob_companyId_slug_key" ON "ListedJob"("companyId", "slug");
CREATE INDEX IF NOT EXISTS "ListedJob_isActive_postedAt_idx" ON "ListedJob"("isActive", "postedAt");
CREATE INDEX IF NOT EXISTS "ListedJob_source_idx" ON "ListedJob"("source");
CREATE INDEX IF NOT EXISTS "ListedJob_location_idx" ON "ListedJob"("location");
CREATE INDEX IF NOT EXISTS "ListedJob_department_idx" ON "ListedJob"("department");

DO $$ BEGIN
  ALTER TABLE "ListedJob" ADD CONSTRAINT "ListedJob_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "ListedCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- JobMockInterview
CREATE TABLE IF NOT EXISTS "JobMockInterview" (
  "id" TEXT NOT NULL,
  "jobId" TEXT,
  "userId" TEXT NOT NULL,
  "type" "JobMockType" NOT NULL DEFAULT 'GENERAL',
  "transcript" TEXT,
  "audioUrl" TEXT,
  "scores" JSONB,
  "feedback" JSONB,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobMockInterview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JobMockInterview_userId_createdAt_idx" ON "JobMockInterview"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "JobMockInterview_jobId_idx" ON "JobMockInterview"("jobId");

DO $$ BEGIN
  ALTER TABLE "JobMockInterview" ADD CONSTRAINT "JobMockInterview_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "ListedJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "JobMockInterview" ADD CONSTRAINT "JobMockInterview_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ManualApplication (personal CRM tracker)
CREATE TABLE IF NOT EXISTS "ManualApplication" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "status" "ManualApplicationStatus" NOT NULL DEFAULT 'APPLIED',
  "notes" TEXT,
  "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ManualApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ManualApplication_userId_status_idx" ON "ManualApplication"("userId", "status");
CREATE INDEX IF NOT EXISTS "ManualApplication_userId_updatedAt_idx" ON "ManualApplication"("userId", "updatedAt");

DO $$ BEGIN
  ALTER TABLE "ManualApplication" ADD CONSTRAINT "ManualApplication_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- JobFetchLog
CREATE TABLE IF NOT EXISTS "JobFetchLog" (
  "id" TEXT NOT NULL,
  "companyId" TEXT,
  "url" TEXT NOT NULL,
  "statusCode" INTEGER,
  "responseSize" INTEGER,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobFetchLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JobFetchLog_companyId_createdAt_idx" ON "JobFetchLog"("companyId", "createdAt");
CREATE INDEX IF NOT EXISTS "JobFetchLog_createdAt_idx" ON "JobFetchLog"("createdAt");

DO $$ BEGIN
  ALTER TABLE "JobFetchLog" ADD CONSTRAINT "JobFetchLog_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "ListedCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
