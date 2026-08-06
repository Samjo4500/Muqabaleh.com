-- Jeannie service engines: tiers, quotas, profile, opportunities, documents

-- AlterEnum UserTier (run once; migrate history prevents re-run)
ALTER TYPE "UserTier" ADD VALUE 'JEANNIE';
ALTER TYPE "UserTier" ADD VALUE 'JEANNIE_PRO';

-- CreateEnum JeannieOpportunityStatus
DO $$ BEGIN
  CREATE TYPE "JeannieOpportunityStatus" AS ENUM (
    'SUGGESTED',
    'AWAITING_APPROVAL',
    'APPROVED',
    'APPLYING',
    'APPLIED',
    'REJECTED_BY_USER',
    'EXPIRED',
    'FAILED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "appliesLeft" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "appliesResetAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cvStudioEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "coverLetterAiEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable JeannieProfile
CREATE TABLE IF NOT EXISTS "JeannieProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seniority" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minSalary" INTEGER,
    "workModes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JeannieProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "JeannieProfile_userId_key" ON "JeannieProfile"("userId");

-- CreateTable JeannieOpportunity
CREATE TABLE IF NOT EXISTS "JeannieOpportunity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "JeannieOpportunityStatus" NOT NULL DEFAULT 'SUGGESTED',
    "b2bJobId" TEXT,
    "externalUrl" TEXT,
    "companyName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "city" TEXT,
    "country" TEXT,
    "matchScore" INTEGER NOT NULL DEFAULT 0,
    "matchReason" TEXT,
    "matchReasonAr" TEXT,
    "coverLetter" TEXT,
    "cvAssetId" TEXT,
    "jobApplicationId" TEXT,
    "failureReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JeannieOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "JeannieOpportunity_idempotencyKey_key" ON "JeannieOpportunity"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "JeannieOpportunity_userId_status_idx" ON "JeannieOpportunity"("userId", "status");
CREATE INDEX IF NOT EXISTS "JeannieOpportunity_userId_createdAt_idx" ON "JeannieOpportunity"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "JeannieOpportunity_b2bJobId_idx" ON "JeannieOpportunity"("b2bJobId");

-- CreateTable JeannieDocument
CREATE TABLE IF NOT EXISTS "JeannieDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentAr" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JeannieDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JeannieDocument_userId_kind_idx" ON "JeannieDocument"("userId", "kind");

-- FKs
DO $$ BEGIN
  ALTER TABLE "JeannieProfile" ADD CONSTRAINT "JeannieProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "JeannieOpportunity" ADD CONSTRAINT "JeannieOpportunity_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "JeannieDocument" ADD CONSTRAINT "JeannieDocument_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
