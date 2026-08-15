-- First-party visitor pageviews + live presence (source of truth).
CREATE TABLE IF NOT EXISTS "visitor_pageviews" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "referrer" TEXT,
    "referrerHost" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "locale" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "ipHash" TEXT,
    "userId" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_pageviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "visitor_pageviews_createdAt_idx" ON "visitor_pageviews"("createdAt");
CREATE INDEX IF NOT EXISTS "visitor_pageviews_visitorId_createdAt_idx" ON "visitor_pageviews"("visitorId", "createdAt");
CREATE INDEX IF NOT EXISTS "visitor_pageviews_sessionId_createdAt_idx" ON "visitor_pageviews"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "visitor_pageviews_path_createdAt_idx" ON "visitor_pageviews"("path", "createdAt");
CREATE INDEX IF NOT EXISTS "visitor_pageviews_country_createdAt_idx" ON "visitor_pageviews"("country", "createdAt");
CREATE INDEX IF NOT EXISTS "visitor_pageviews_isBot_isStaff_createdAt_idx" ON "visitor_pageviews"("isBot", "isStaff", "createdAt");

CREATE TABLE IF NOT EXISTS "visitor_presence" (
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "locale" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "userId" TEXT,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_presence_pkey" PRIMARY KEY ("sessionId")
);

CREATE INDEX IF NOT EXISTS "visitor_presence_lastSeenAt_idx" ON "visitor_presence"("lastSeenAt");

ALTER TABLE "visitor_pageviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "visitor_presence" ENABLE ROW LEVEL SECURITY;
