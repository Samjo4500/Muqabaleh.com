-- CreateTable
CREATE TABLE IF NOT EXISTS "api_rate_limits" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "api_rate_limits_key_key" ON "api_rate_limits"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "api_rate_limits_resetAt_idx" ON "api_rate_limits"("resetAt");

ALTER TABLE "api_rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_rate_limits" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "api_rate_limits_service" ON "api_rate_limits";
CREATE POLICY "api_rate_limits_service" ON "api_rate_limits"
  FOR ALL
  USING (true)
  WITH CHECK (true);
