-- Seeker work preferences: fulltime | parttime | remote (comma-separated)
ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "workPreferences" TEXT;
CREATE INDEX IF NOT EXISTS "CandidatePool_workPreferences_idx" ON "CandidatePool"("workPreferences");
