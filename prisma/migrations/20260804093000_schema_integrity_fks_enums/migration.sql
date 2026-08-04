-- P0.5 schema integrity: enums, FKs, unify Interviewer, expand Payment/Payout
-- IMPORTANT: Run scripts/clean-orphaned-data.ts BEFORE applying this migration.

-- ── Enums ──
CREATE TYPE "UserRole" AS ENUM ('USER', 'INTERVIEWER', 'ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN');
CREATE TYPE "UserTier" AS ENUM ('FREE', 'BASIC', 'PRO', 'PREMIUM', 'UNLIMITED');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW', 'REFUNDED');
CREATE TYPE "InterviewerStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED');
CREATE TYPE "PaymentType" AS ENUM ('AI_PACKAGE', 'BOOKING', 'SUBSCRIPTION');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');

-- Drop FKs that will be recreated / retargeted
ALTER TABLE "CompanyPanel" DROP CONSTRAINT IF EXISTS "CompanyPanel_interviewerId_fkey";
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_userId_fkey";
ALTER TABLE "InterviewerProfile" DROP CONSTRAINT IF EXISTS "InterviewerProfile_userId_fkey";
ALTER TABLE "Availability" DROP CONSTRAINT IF EXISTS "Availability_interviewerId_fkey";
ALTER TABLE "HumanBooking" DROP CONSTRAINT IF EXISTS "HumanBooking_interviewerId_fkey";
ALTER TABLE "InterviewerPayout" DROP CONSTRAINT IF EXISTS "InterviewerPayout_interviewerId_fkey";

-- ── User: role + tier (preserve data) ──
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tier" "UserTier";
UPDATE "User"
SET "tier" = CASE
  WHEN "subscriptionTier" IN ('FREE','BASIC','PRO','PREMIUM','UNLIMITED')
    THEN "subscriptionTier"::"UserTier"
  ELSE 'FREE'::"UserTier"
END
WHERE "tier" IS NULL;
ALTER TABLE "User" ALTER COLUMN "tier" SET DEFAULT 'FREE'::"UserTier";
ALTER TABLE "User" ALTER COLUMN "tier" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionTier";

ALTER TABLE "User" ADD COLUMN "role_new" "UserRole";
UPDATE "User"
SET "role_new" = CASE
  WHEN role IN ('ADMIN') THEN 'SUPER_ADMIN'::"UserRole"
  WHEN role IN ('USER','INTERVIEWER','SUPER_ADMIN','COMPANY_ADMIN','ADMIN')
    THEN role::"UserRole"
  ELSE 'USER'::"UserRole"
END;
ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" RENAME COLUMN "role_new" TO "role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER'::"UserRole";
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;

-- ── Interviewer: add profile fields + status enum ──
ALTER TABLE "Interviewer" ADD COLUMN IF NOT EXISTS "bioEn" TEXT;
ALTER TABLE "Interviewer" ADD COLUMN IF NOT EXISTS "currentTitle" TEXT;
ALTER TABLE "Interviewer" ADD COLUMN IF NOT EXISTS "excludedCompanies" TEXT;
ALTER TABLE "Interviewer" ADD COLUMN IF NOT EXISTS "excludedIndustries" TEXT;
ALTER TABLE "Interviewer" ADD COLUMN IF NOT EXISTS "expertise" TEXT;
ALTER TABLE "Interviewer" ADD COLUMN IF NOT EXISTS "ndaAcceptedAt" TIMESTAMP(3);
ALTER TABLE "Interviewer" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
ALTER TABLE "Interviewer" ADD COLUMN IF NOT EXISTS "sessionPriceUsdCents" INTEGER;
ALTER TABLE "Interviewer" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Interviewer" ADD COLUMN IF NOT EXISTS "timezone" TEXT;

-- Merge InterviewerProfile → Interviewer by userId (if profile table still exists)
DO $$
BEGIN
  IF to_regclass('public."InterviewerProfile"') IS NOT NULL THEN
    UPDATE "Interviewer" i
    SET
      "bioEn" = COALESCE(i."bioEn", NULLIF(p."bioEn", '')),
      "bioAr" = COALESCE(i."bioAr", NULLIF(p."bioAr", '')),
      "slug" = COALESCE(i."slug", p."slug"),
      "currentTitle" = COALESCE(i."currentTitle", p."currentTitle"),
      "photoUrl" = COALESCE(i."photoUrl", p."photoUrl"),
      "sessionPriceUsdCents" = COALESCE(i."sessionPriceUsdCents", p."sessionPriceUsdCents"),
      "excludedCompanies" = COALESCE(i."excludedCompanies", p."excludedCompanies"),
      "excludedIndustries" = COALESCE(i."excludedIndustries", p."excludedIndustries"),
      "ndaAcceptedAt" = COALESCE(i."ndaAcceptedAt", p."ndaAcceptedAt"),
      "expertise" = COALESCE(i."expertise", p."currentTitle")
    FROM "InterviewerProfile" p
    WHERE p."userId" = i."userId";

    INSERT INTO "Interviewer" (
      id, "userId", status, "fullName", "bioAr", "bioEn", slug,
      "currentTitle", "photoUrl", "yearsExperience", specialties, industries,
      languages, "hourlyRate", "sessionPriceUsdCents", "createdAt", "updatedAt"
    )
    SELECT
      gen_random_uuid()::text,
      p."userId",
      'PENDING',
      COALESCE(u.name, split_part(u.email, '@', 1), 'Interviewer'),
      NULLIF(p."bioAr", ''),
      NULLIF(p."bioEn", ''),
      p.slug,
      p."currentTitle",
      p."photoUrl",
      COALESCE(p."yearsExperience", 0),
      COALESCE(p.industries, '[]'),
      COALESCE(p.industries, '[]'),
      COALESCE(p.languages, '["AR"]'),
      COALESCE(p."sessionPriceUsdCents", 4900),
      p."sessionPriceUsdCents",
      NOW(),
      NOW()
    FROM "InterviewerProfile" p
    JOIN "User" u ON u.id = p."userId"
    WHERE NOT EXISTS (SELECT 1 FROM "Interviewer" i WHERE i."userId" = p."userId");
  END IF;
END $$;

ALTER TABLE "Interviewer" ADD COLUMN "status_new" "InterviewerStatus";
UPDATE "Interviewer"
SET "status_new" = CASE
  WHEN status IN ('APPROVED','ACTIVE') THEN 'ACTIVE'::"InterviewerStatus"
  WHEN status IN ('BLOCKED','SUSPENDED') THEN 'SUSPENDED'::"InterviewerStatus"
  WHEN status = 'REJECTED' THEN 'REJECTED'::"InterviewerStatus"
  ELSE 'PENDING'::"InterviewerStatus"
END;
ALTER TABLE "Interviewer" DROP COLUMN "status";
ALTER TABLE "Interviewer" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "Interviewer" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"InterviewerStatus";
ALTER TABLE "Interviewer" ALTER COLUMN "status" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Interviewer_slug_key" ON "Interviewer"("slug");
CREATE INDEX IF NOT EXISTS "Interviewer_status_idx" ON "Interviewer"("status");

-- ── HumanBooking ──
ALTER TABLE "HumanBooking" ADD COLUMN "status_new" "BookingStatus";
UPDATE "HumanBooking"
SET "status_new" = CASE
  WHEN status IN ('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','RESCHEDULED','NO_SHOW','REFUNDED')
    THEN status::"BookingStatus"
  ELSE 'PENDING'::"BookingStatus"
END;
ALTER TABLE "HumanBooking" DROP COLUMN "status";
ALTER TABLE "HumanBooking" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "HumanBooking" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"BookingStatus";
ALTER TABLE "HumanBooking" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "HumanBooking" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "HumanBooking" ALTER COLUMN "interviewerId" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "HumanBooking_status_idx" ON "HumanBooking"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "HumanBooking_interviewerId_scheduledAt_key"
  ON "HumanBooking"("interviewerId", "scheduledAt");

-- ── Payment ──
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "amount" DOUBLE PRECISION;
UPDATE "Payment"
SET "amount" = COALESCE("amountUsdCents", 0)::double precision / 100.0
WHERE "amount" IS NULL;
ALTER TABLE "Payment" ALTER COLUMN "amount" SET NOT NULL;

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "bookingId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paypalSubscriptionId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "type" "PaymentType";
UPDATE "Payment"
SET "type" = CASE
  WHEN "packageType" IN ('STANDARD_HUMAN','PRO_HUMAN') THEN 'BOOKING'::"PaymentType"
  WHEN "packageType" ILIKE '%SUB%' THEN 'SUBSCRIPTION'::"PaymentType"
  ELSE 'AI_PACKAGE'::"PaymentType"
END
WHERE "type" IS NULL;
ALTER TABLE "Payment" ALTER COLUMN "type" SET NOT NULL;

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

ALTER TABLE "Payment" ADD COLUMN "status_new" "PaymentStatus";
UPDATE "Payment"
SET "status_new" = CASE
  WHEN status IN ('CAPTURED','COMPLETED') THEN 'COMPLETED'::"PaymentStatus"
  WHEN status IN ('REFUNDED') THEN 'REFUNDED'::"PaymentStatus"
  WHEN status IN ('FAILED') THEN 'FAILED'::"PaymentStatus"
  ELSE 'PENDING'::"PaymentStatus"
END;
ALTER TABLE "Payment" DROP COLUMN "status";
ALTER TABLE "Payment" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"PaymentStatus";
ALTER TABLE "Payment" ALTER COLUMN "status" SET NOT NULL;

ALTER TABLE "Payment" DROP COLUMN IF EXISTS "amountUsdCents";
ALTER TABLE "Payment" ALTER COLUMN "packageType" DROP NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "paypalOrderId" DROP NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "idempotencyKey" DROP NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "userId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX IF NOT EXISTS "Payment_type_idx" ON "Payment"("type");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");

-- ── InterviewerPayout ──
ALTER TABLE "InterviewerPayout" ADD COLUMN IF NOT EXISTS "batchId" TEXT;
UPDATE "InterviewerPayout"
SET "batchId" = COALESCE("batchId", "paypalBatchId")
WHERE "batchId" IS NULL AND EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'InterviewerPayout' AND column_name = 'paypalBatchId'
);
ALTER TABLE "InterviewerPayout" DROP COLUMN IF EXISTS "paypalBatchId";

ALTER TABLE "InterviewerPayout" ADD COLUMN IF NOT EXISTS "bookingIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "InterviewerPayout" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "InterviewerPayout" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- amount was Int cents → Float dollars
ALTER TABLE "InterviewerPayout" ALTER COLUMN "amount" TYPE DOUBLE PRECISION
  USING ("amount"::double precision / 100.0);

ALTER TABLE "InterviewerPayout" ADD COLUMN IF NOT EXISTS "userId" TEXT;
UPDATE "InterviewerPayout" p
SET "userId" = i."userId"
FROM "Interviewer" i
WHERE p."interviewerId" = i.id AND (p."userId" IS NULL OR p."userId" = '');
-- Drop any payouts still without userId
DELETE FROM "InterviewerPayout" WHERE "userId" IS NULL OR "userId" = '';
ALTER TABLE "InterviewerPayout" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "InterviewerPayout" ALTER COLUMN "paypalEmail" DROP NOT NULL;

ALTER TABLE "InterviewerPayout" ADD COLUMN "status_new" "PayoutStatus";
UPDATE "InterviewerPayout"
SET "status_new" = CASE
  WHEN status = 'REJECTED' THEN 'FAILED'::"PayoutStatus"
  WHEN status IN ('PENDING','PROCESSING','COMPLETED','FAILED','REJECTED')
    THEN status::"PayoutStatus"
  ELSE 'PENDING'::"PayoutStatus"
END;
ALTER TABLE "InterviewerPayout" DROP COLUMN "status";
ALTER TABLE "InterviewerPayout" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "InterviewerPayout" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"PayoutStatus";
ALTER TABLE "InterviewerPayout" ALTER COLUMN "status" SET NOT NULL;

DROP INDEX IF EXISTS "InterviewerPayout_paypalBatchId_idx";
CREATE INDEX IF NOT EXISTS "InterviewerPayout_userId_idx" ON "InterviewerPayout"("userId");
CREATE INDEX IF NOT EXISTS "InterviewerPayout_status_idx" ON "InterviewerPayout"("status");
CREATE INDEX IF NOT EXISTS "InterviewerPayout_batchId_idx" ON "InterviewerPayout"("batchId");

-- Clear CompanyPanel rows that still point at InterviewerProfile ids
DELETE FROM "CompanyPanel" cp
WHERE NOT EXISTS (SELECT 1 FROM "Interviewer" i WHERE i.id = cp."interviewerId");

-- Drop legacy profile tables
DROP TABLE IF EXISTS "Availability";
DROP TABLE IF EXISTS "InterviewerProfile";

-- ── Foreign keys ──
ALTER TABLE "CompanyPanel"
  ADD CONSTRAINT "CompanyPanel_interviewerId_fkey"
  FOREIGN KEY ("interviewerId") REFERENCES "Interviewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "HumanBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Interviewer"
  ADD CONSTRAINT "Interviewer_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HumanBooking"
  ADD CONSTRAINT "HumanBooking_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HumanBooking"
  ADD CONSTRAINT "HumanBooking_interviewerId_fkey"
  FOREIGN KEY ("interviewerId") REFERENCES "Interviewer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InterviewerPayout"
  ADD CONSTRAINT "InterviewerPayout_interviewerId_fkey"
  FOREIGN KEY ("interviewerId") REFERENCES "Interviewer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InterviewerPayout"
  ADD CONSTRAINT "InterviewerPayout_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
