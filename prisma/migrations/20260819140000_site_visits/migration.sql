-- First-party anonymous pageviews for Super Admin.
-- No IP, email, or user id. Prisma role bypasses RLS; PostgREST stays locked out.

CREATE TABLE IF NOT EXISTS "site_visits" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "visitorKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_visits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "site_visits_createdAt_idx" ON "site_visits"("createdAt");
CREATE INDEX IF NOT EXISTS "site_visits_visitorKey_createdAt_idx" ON "site_visits"("visitorKey", "createdAt");
CREATE INDEX IF NOT EXISTS "site_visits_path_createdAt_idx" ON "site_visits"("path", "createdAt");

ALTER TABLE "site_visits" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE public.site_visits FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE public.site_visits FROM authenticated';
  END IF;
END $$;
