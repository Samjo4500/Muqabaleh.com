-- Jeannie external apply system: job catalog + SLA promise ledger

CREATE TYPE "JeannieSlaStatus" AS ENUM ('ACTIVE', 'FULFILLED', 'ROLLED_OVER', 'CLOSED');

CREATE TABLE "JeannieJobListing" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceJobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "description" TEXT,
    "applyUrl" TEXT,
    "applyEmail" TEXT,
    "seniority" TEXT,
    "employmentType" TEXT,
    "raw" JSONB,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JeannieJobListing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JeannieJobListing_source_sourceJobId_key" ON "JeannieJobListing"("source", "sourceJobId");
CREATE INDEX "JeannieJobListing_isActive_country_idx" ON "JeannieJobListing"("isActive", "country");
CREATE INDEX "JeannieJobListing_fetchedAt_idx" ON "JeannieJobListing"("fetchedAt");
CREATE INDEX "JeannieJobListing_applyEmail_idx" ON "JeannieJobListing"("applyEmail");

CREATE TABLE "JeannieSlaPeriod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "promisedApplies" INTEGER NOT NULL,
    "deliveredApplies" INTEGER NOT NULL DEFAULT 0,
    "rolledInApplies" INTEGER NOT NULL DEFAULT 0,
    "rolledOutApplies" INTEGER NOT NULL DEFAULT 0,
    "status" "JeannieSlaStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JeannieSlaPeriod_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JeannieSlaPeriod_userId_status_idx" ON "JeannieSlaPeriod"("userId", "status");
CREATE INDEX "JeannieSlaPeriod_periodEnd_status_idx" ON "JeannieSlaPeriod"("periodEnd", "status");
CREATE INDEX "JeannieSlaPeriod_userId_periodStart_idx" ON "JeannieSlaPeriod"("userId", "periodStart");

ALTER TABLE "JeannieSlaPeriod" ADD CONSTRAINT "JeannieSlaPeriod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JeannieOpportunity" ADD COLUMN "listingId" TEXT;
ALTER TABLE "JeannieOpportunity" ADD COLUMN "applyEmail" TEXT;
ALTER TABLE "JeannieOpportunity" ADD COLUMN "applyChannel" TEXT;
ALTER TABLE "JeannieOpportunity" ADD COLUMN "descriptionSnippet" TEXT;
ALTER TABLE "JeannieOpportunity" ADD COLUMN "employerMsgId" TEXT;

CREATE INDEX "JeannieOpportunity_listingId_idx" ON "JeannieOpportunity"("listingId");
CREATE INDEX "JeannieOpportunity_applyEmail_idx" ON "JeannieOpportunity"("applyEmail");

ALTER TABLE "JeannieOpportunity" ADD CONSTRAINT "JeannieOpportunity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "JeannieJobListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
