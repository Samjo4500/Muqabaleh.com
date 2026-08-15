-- First-party conversion funnel events (GA4 dual-write).
CREATE TABLE IF NOT EXISTS "funnel_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT,
    "role" TEXT,
    "durationSeconds" INTEGER,
    "guideType" TEXT,
    "guideSlug" TEXT,
    "location" TEXT,
    "plan" TEXT,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funnel_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "funnel_events_name_createdAt_idx" ON "funnel_events"("name", "createdAt");
CREATE INDEX IF NOT EXISTS "funnel_events_createdAt_idx" ON "funnel_events"("createdAt");
CREATE INDEX IF NOT EXISTS "funnel_events_name_guideSlug_idx" ON "funnel_events"("name", "guideSlug");

-- Prisma uses the table owner role (bypasses RLS). PostgREST stays denied.
ALTER TABLE "funnel_events" ENABLE ROW LEVEL SECURITY;
