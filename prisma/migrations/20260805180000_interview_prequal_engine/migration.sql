-- AI Mock Interview Engine: pre-qual → plan → session → report

CREATE TABLE IF NOT EXISTS "interview_prequal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "targetRoleAr" TEXT,
    "seniorityLevel" TEXT NOT NULL,
    "questionTypes" TEXT[] NOT NULL,
    "interviewRound" TEXT NOT NULL,
    "languagePreference" TEXT NOT NULL,
    "targetIndustry" TEXT,
    "targetIndustryAr" TEXT,
    "weaknessFocus" TEXT,
    "weaknessFocusAr" TEXT,
    "durationPreset" TEXT NOT NULL,
    "numQuestions" INTEGER NOT NULL,
    "estimatedDurationMin" INTEGER NOT NULL,
    "generatedPlan" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "interview_prequal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "interview_prequal_sessionId_key" ON "interview_prequal"("sessionId");
CREATE INDEX IF NOT EXISTS "interview_prequal_userId_idx" ON "interview_prequal"("userId");
CREATE INDEX IF NOT EXISTS "interview_prequal_sessionId_idx" ON "interview_prequal"("sessionId");

CREATE TABLE IF NOT EXISTS "interview_questions" (
    "id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionTextAr" TEXT,
    "answerTemplate" TEXT,
    "answerTemplateAr" TEXT,
    "roleCategory" TEXT NOT NULL,
    "seniorityLevel" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "interviewRound" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL,
    "industryContext" TEXT,
    "followUpQuestions" JSONB,
    "evaluationRubric" JSONB,
    "timeLimitSeconds" INTEGER NOT NULL,
    "coachingTips" TEXT[] NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "avgScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "interview_questions_roleCategory_seniorityLevel_questionType_interviewRound_idx"
  ON "interview_questions"("roleCategory", "seniorityLevel", "questionType", "interviewRound");
CREATE INDEX IF NOT EXISTS "interview_questions_difficulty_idx" ON "interview_questions"("difficulty");
CREATE INDEX IF NOT EXISTS "interview_questions_tags_idx" ON "interview_questions" USING GIN ("tags");

CREATE TABLE IF NOT EXISTS "interview_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prequalId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "language" TEXT NOT NULL,
    "numQuestionsTotal" INTEGER NOT NULL,
    "numQuestionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalDurationSeconds" INTEGER,
    "overallScore" DOUBLE PRECISION,
    "strengths" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "actionItems" JSONB,
    "fullReport" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "interview_sessions_prequalId_key" ON "interview_sessions"("prequalId");
CREATE INDEX IF NOT EXISTS "interview_sessions_userId_idx" ON "interview_sessions"("userId");
CREATE INDEX IF NOT EXISTS "interview_sessions_status_idx" ON "interview_sessions"("status");

CREATE TABLE IF NOT EXISTS "interview_responses" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionOrder" INTEGER NOT NULL DEFAULT 0,
    "userAnswer" TEXT NOT NULL,
    "userAnswerAr" TEXT,
    "contentScore" DOUBLE PRECISION,
    "structureScore" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "feedbackText" TEXT,
    "feedbackTextAr" TEXT,
    "improvementTip" TEXT,
    "improvementTipAr" TEXT,
    "rawAiResponse" JSONB,
    "timeTakenSeconds" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "followUpCount" INTEGER NOT NULL DEFAULT 0,
    "followUpResponses" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interview_responses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "interview_responses_sessionId_idx" ON "interview_responses"("sessionId");
CREATE INDEX IF NOT EXISTS "interview_responses_questionId_idx" ON "interview_responses"("questionId");

DO $$ BEGIN
  ALTER TABLE "interview_prequal"
    ADD CONSTRAINT "interview_prequal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "interview_sessions"
    ADD CONSTRAINT "interview_sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "interview_sessions"
    ADD CONSTRAINT "interview_sessions_prequalId_fkey"
    FOREIGN KEY ("prequalId") REFERENCES "interview_prequal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "interview_responses"
    ADD CONSTRAINT "interview_responses_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
