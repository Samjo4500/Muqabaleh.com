-- CreateEnum
CREATE TYPE "JobPostingStatus" AS ENUM ('DRAFT', 'OPEN', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('NEW', 'REVIEWING', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- AlterTable B2BJob — public ATS posting fields
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "titleAr" TEXT;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "descriptionAr" TEXT;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "requirements" TEXT;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "benefits" TEXT;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "employmentType" TEXT NOT NULL DEFAULT 'fulltime';
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "salaryRange" TEXT;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "tags" TEXT;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "status" "JobPostingStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "B2BJob" ADD COLUMN IF NOT EXISTS "closesAt" TIMESTAMP(3);

-- CreateTable MediaAsset
CREATE TABLE IF NOT EXISTS "MediaAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "kind" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable JobApplication
CREATE TABLE IF NOT EXISTS "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "stage" "ApplicationStage" NOT NULL DEFAULT 'NEW',
    "coverLetter" TEXT,
    "cvAssetId" TEXT,
    "photoAssetId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'DIRECT',
    "employerNote" TEXT,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- AlterTable CandidatePool
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "openToWork" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "headline" TEXT;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "summary" TEXT;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "skills" TEXT;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "yearsExperience" INTEGER;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "linkedInUrl" TEXT;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "desiredRole" TEXT;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "desiredLocations" TEXT;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "cvAssetId" TEXT;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "cvFileName" TEXT;
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "photoAssetId" TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS "B2BJob_status_isPublic_idx" ON "B2BJob"("status", "isPublic");
CREATE INDEX IF NOT EXISTS "B2BJob_city_idx" ON "B2BJob"("city");
CREATE INDEX IF NOT EXISTS "B2BJob_department_idx" ON "B2BJob"("department");
CREATE INDEX IF NOT EXISTS "MediaAsset_userId_idx" ON "MediaAsset"("userId");
CREATE INDEX IF NOT EXISTS "MediaAsset_kind_idx" ON "MediaAsset"("kind");
CREATE INDEX IF NOT EXISTS "JobApplication_jobId_stage_idx" ON "JobApplication"("jobId", "stage");
CREATE INDEX IF NOT EXISTS "JobApplication_candidateId_idx" ON "JobApplication"("candidateId");
CREATE INDEX IF NOT EXISTS "JobApplication_stage_idx" ON "JobApplication"("stage");
CREATE INDEX IF NOT EXISTS "CandidatePool_openToWork_idx" ON "CandidatePool"("openToWork");
CREATE INDEX IF NOT EXISTS "CandidatePool_industry_idx" ON "CandidatePool"("industry");
CREATE INDEX IF NOT EXISTS "CandidatePool_location_idx" ON "CandidatePool"("location");

-- Uniques / FKs
CREATE UNIQUE INDEX IF NOT EXISTS "JobApplication_jobId_candidateId_key" ON "JobApplication"("jobId", "candidateId");

DO $$ BEGIN
  ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "B2BJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
