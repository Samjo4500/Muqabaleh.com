-- Partner Console / White-label platform

-- Extend UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PARTNER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PARTNER_MEMBER';

-- Partners
CREATE TABLE IF NOT EXISTS "partners" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "plan" TEXT NOT NULL DEFAULT 'STARTER',
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "website" TEXT,
    "country" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#14B8A6',
    "accentColor" TEXT NOT NULL DEFAULT '#D4A843',
    "customDomain" TEXT,
    "customDomainVerified" BOOLEAN NOT NULL DEFAULT false,
    "supportEmail" TEXT,
    "fromEmailName" TEXT,
    "commissionBps" INTEGER NOT NULL DEFAULT 2000,
    "creditsPool" INTEGER NOT NULL DEFAULT 50,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "partners_slug_key" ON "partners"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "partners_contactEmail_key" ON "partners"("contactEmail");
CREATE UNIQUE INDEX IF NOT EXISTS "partners_customDomain_key" ON "partners"("customDomain");
CREATE INDEX IF NOT EXISTS "partners_status_idx" ON "partners"("status");
CREATE INDEX IF NOT EXISTS "partners_plan_idx" ON "partners"("plan");

-- User.partnerId
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "partnerId" TEXT;
CREATE INDEX IF NOT EXISTS "User_partnerId_idx" ON "User"("partnerId");

-- Company.partnerId + status
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "partnerId" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';
CREATE INDEX IF NOT EXISTS "Company_partnerId_idx" ON "Company"("partnerId");
CREATE INDEX IF NOT EXISTS "Company_status_idx" ON "Company"("status");

-- PartnerApplication.partnerId
ALTER TABLE "partner_applications" ADD COLUMN IF NOT EXISTS "partnerId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "partner_applications_partnerId_key" ON "partner_applications"("partnerId");

CREATE TABLE IF NOT EXISTS "partner_api_keys" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHint" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY['read', 'write']::TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partner_api_keys_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "partner_api_keys_partnerId_idx" ON "partner_api_keys"("partnerId");
CREATE INDEX IF NOT EXISTS "partner_api_keys_keyHash_idx" ON "partner_api_keys"("keyHash");

CREATE TABLE IF NOT EXISTS "partner_webhooks" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[] DEFAULT ARRAY['interview.completed', 'candidate.scored']::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastDeliveryAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partner_webhooks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "partner_webhooks_partnerId_idx" ON "partner_webhooks"("partnerId");

CREATE TABLE IF NOT EXISTS "partner_webhook_deliveries" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partner_webhook_deliveries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "partner_webhook_deliveries_partnerId_idx" ON "partner_webhook_deliveries"("partnerId");
CREATE INDEX IF NOT EXISTS "partner_webhook_deliveries_webhookId_idx" ON "partner_webhook_deliveries"("webhookId");

CREATE TABLE IF NOT EXISTS "partner_payouts" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partner_payouts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "partner_payouts_partnerId_idx" ON "partner_payouts"("partnerId");
CREATE INDEX IF NOT EXISTS "partner_payouts_status_idx" ON "partner_payouts"("status");

CREATE TABLE IF NOT EXISTS "partner_invoices" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partner_invoices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "partner_invoices_partnerId_number_key" ON "partner_invoices"("partnerId", "number");
CREATE INDEX IF NOT EXISTS "partner_invoices_partnerId_idx" ON "partner_invoices"("partnerId");

-- FKs (ignore if already present)
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Company" ADD CONSTRAINT "Company_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "partner_applications" ADD CONSTRAINT "partner_applications_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "partner_api_keys" ADD CONSTRAINT "partner_api_keys_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "partner_webhooks" ADD CONSTRAINT "partner_webhooks_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "partner_webhook_deliveries" ADD CONSTRAINT "partner_webhook_deliveries_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "partner_webhook_deliveries" ADD CONSTRAINT "partner_webhook_deliveries_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "partner_webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "partner_payouts" ADD CONSTRAINT "partner_payouts_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "partner_invoices" ADD CONSTRAINT "partner_invoices_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
