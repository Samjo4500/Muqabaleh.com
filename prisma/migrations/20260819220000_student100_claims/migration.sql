-- Student 100 Interview Pack claims. Prisma role bypasses RLS; PostgREST stays locked out.

CREATE TABLE IF NOT EXISTS "student100_claims" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL,
    "universityEmail" TEXT,
    "proofNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "creditsGranted" INTEGER NOT NULL DEFAULT 0,
    "creditsRemaining" INTEGER NOT NULL DEFAULT 0,
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "student100_claims_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "student100_claims_userId_key" ON "student100_claims"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "student100_claims_email_key" ON "student100_claims"("email");
CREATE INDEX IF NOT EXISTS "student100_claims_status_createdAt_idx" ON "student100_claims"("status", "createdAt");

DO $$
BEGIN
  IF to_regclass('public."User"') IS NOT NULL THEN
    ALTER TABLE "student100_claims"
      ADD CONSTRAINT "student100_claims_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "student100_claims" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE public.student100_claims FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE public.student100_claims FROM authenticated';
  END IF;
END $$;
