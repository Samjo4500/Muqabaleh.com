-- AlterEnum: PACKET_READY for external apply packets (not live-submitted)
DO $$ BEGIN
  ALTER TYPE "JeannieOpportunityStatus" ADD VALUE 'PACKET_READY';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- InterviewSession: consume practice entitlement at start
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "practiceDebited" BOOLEAN NOT NULL DEFAULT false;

-- JeannieOpportunity: passport verification snapshot on apply/packet
ALTER TABLE "JeannieOpportunity" ADD COLUMN IF NOT EXISTS "passportVerificationId" TEXT;
