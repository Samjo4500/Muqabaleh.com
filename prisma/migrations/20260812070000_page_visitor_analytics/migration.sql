-- First-party website visitor analytics

CREATE TABLE "analytics_visitors" (
    "id" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "deviceClass" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analytics_visitors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "analytics_sessions" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "landingPath" TEXT,
    "exitPath" TEXT,
    "entryUrl" TEXT,
    "referrer" TEXT,
    "referrerHost" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "locale" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "deviceClass" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "screenW" INTEGER,
    "screenH" INTEGER,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "maxScrollPct" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "ipHash" TEXT,

    CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "pathNorm" TEXT NOT NULL,
    "query" TEXT,
    "hash" TEXT,
    "locale" TEXT,
    "title" TEXT,
    "referrer" TEXT,
    "previousPath" TEXT,
    "durationMs" INTEGER,
    "scrollPct" INTEGER,
    "clickHref" TEXT,
    "clickText" TEXT,
    "screenW" INTEGER,
    "screenH" INTEGER,
    "viewportW" INTEGER,
    "viewportH" INTEGER,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "deviceClass" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "ipHash" TEXT,
    "timezone" TEXT,
    "language" TEXT,
    "connection" TEXT,
    "meta" JSONB,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "analytics_visitors_lastSeenAt_idx" ON "analytics_visitors"("lastSeenAt");
CREATE INDEX "analytics_visitors_userId_idx" ON "analytics_visitors"("userId");
CREATE INDEX "analytics_visitors_country_idx" ON "analytics_visitors"("country");

CREATE INDEX "analytics_sessions_visitorId_startedAt_idx" ON "analytics_sessions"("visitorId", "startedAt");
CREATE INDEX "analytics_sessions_startedAt_idx" ON "analytics_sessions"("startedAt");
CREATE INDEX "analytics_sessions_utmSource_startedAt_idx" ON "analytics_sessions"("utmSource", "startedAt");
CREATE INDEX "analytics_sessions_referrerHost_startedAt_idx" ON "analytics_sessions"("referrerHost", "startedAt");
CREATE INDEX "analytics_sessions_country_startedAt_idx" ON "analytics_sessions"("country", "startedAt");
CREATE INDEX "analytics_sessions_deviceClass_startedAt_idx" ON "analytics_sessions"("deviceClass", "startedAt");

CREATE INDEX "analytics_events_occurredAt_idx" ON "analytics_events"("occurredAt");
CREATE INDEX "analytics_events_type_occurredAt_idx" ON "analytics_events"("type", "occurredAt");
CREATE INDEX "analytics_events_pathNorm_occurredAt_idx" ON "analytics_events"("pathNorm", "occurredAt");
CREATE INDEX "analytics_events_sessionId_occurredAt_idx" ON "analytics_events"("sessionId", "occurredAt");
CREATE INDEX "analytics_events_visitorId_occurredAt_idx" ON "analytics_events"("visitorId", "occurredAt");
CREATE INDEX "analytics_events_country_occurredAt_idx" ON "analytics_events"("country", "occurredAt");
CREATE INDEX "analytics_events_utmSource_occurredAt_idx" ON "analytics_events"("utmSource", "occurredAt");
CREATE INDEX "analytics_events_deviceClass_occurredAt_idx" ON "analytics_events"("deviceClass", "occurredAt");

ALTER TABLE "analytics_sessions" ADD CONSTRAINT "analytics_sessions_visitorId_fkey"
  FOREIGN KEY ("visitorId") REFERENCES "analytics_visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_visitorId_fkey"
  FOREIGN KEY ("visitorId") REFERENCES "analytics_visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "analytics_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase advisor: enable RLS, no PostgREST policies (Prisma uses DB role)
ALTER TABLE "analytics_visitors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "analytics_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "analytics_events" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE public.analytics_visitors FROM anon';
    EXECUTE 'REVOKE ALL ON TABLE public.analytics_sessions FROM anon';
    EXECUTE 'REVOKE ALL ON TABLE public.analytics_events FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE public.analytics_visitors FROM authenticated';
    EXECUTE 'REVOKE ALL ON TABLE public.analytics_sessions FROM authenticated';
    EXECUTE 'REVOKE ALL ON TABLE public.analytics_events FROM authenticated';
  END IF;
END $$;
