-- First-party marketing CRM (emails + PII + consent + UTM)
CREATE TABLE IF NOT EXISTS "marketing_contacts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "location" TEXT,
    "industry" TEXT,
    "experience" TEXT,
    "role" TEXT,
    "level" TEXT,
    "linkedInUrl" TEXT,
    "locale" TEXT,
    "source" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "landingPath" TEXT,
    "referrer" TEXT,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT true,
    "marketingOptInAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_contacts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "marketing_contacts_email_key" ON "marketing_contacts"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "marketing_contacts_userId_key" ON "marketing_contacts"("userId");
CREATE INDEX IF NOT EXISTS "marketing_contacts_marketingOptIn_idx" ON "marketing_contacts"("marketingOptIn");
CREATE INDEX IF NOT EXISTS "marketing_contacts_source_idx" ON "marketing_contacts"("source");
CREATE INDEX IF NOT EXISTS "marketing_contacts_country_idx" ON "marketing_contacts"("country");
CREATE INDEX IF NOT EXISTS "marketing_contacts_createdAt_idx" ON "marketing_contacts"("createdAt");
CREATE INDEX IF NOT EXISTS "marketing_contacts_lastSeenAt_idx" ON "marketing_contacts"("lastSeenAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketing_contacts_userId_fkey'
  ) THEN
    ALTER TABLE "marketing_contacts"
      ADD CONSTRAINT "marketing_contacts_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
