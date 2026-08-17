-- Gates & email nurture (Brevo sequences, preference center)

CREATE TABLE "nurture_leads" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "currentCity" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "yearsExperience" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'EN',
    "source" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "userId" TEXT,
    "lastOverallScore" INTEGER,
    "lastScoreDelta" INTEGER,
    "lastStrengths" TEXT NOT NULL DEFAULT '[]',
    "lastImprovements" TEXT NOT NULL DEFAULT '[]',
    "lastCompetencies" TEXT NOT NULL DEFAULT '{}',
    "lastRole" TEXT,
    "lastCompany" TEXT,
    "lastJobId" TEXT,
    "practiceCount" INTEGER NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "lastJobsBrowseAt" TIMESTAMP(3),
    "lastJobClickAt" TIMESTAMP(3),
    "lastApplyClickAt" TIMESTAMP(3),
    "lastEmailOpenAt" TIMESTAMP(3),
    "lastEmailSentAt" TIMESTAMP(3),
    "consecutiveNoOpens" INTEGER NOT NULL DEFAULT 0,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Dubai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nurture_leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nurture_leads_email_key" ON "nurture_leads"("email");
CREATE INDEX "nurture_leads_userId_idx" ON "nurture_leads"("userId");
CREATE INDEX "nurture_leads_source_idx" ON "nurture_leads"("source");

CREATE TABLE "nurture_preferences" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'NORMAL',
    "pausedUntil" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nurture_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nurture_preferences_leadId_key" ON "nurture_preferences"("leadId");
CREATE UNIQUE INDEX "nurture_preferences_token_key" ON "nurture_preferences"("token");

CREATE TABLE "nurture_enrollments" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "sequence" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSentAt" TIMESTAMP(3),
    "nextSendAt" TIMESTAMP(3),
    "metadata" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "nurture_enrollments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nurture_enrollments_leadId_sequence_key" ON "nurture_enrollments"("leadId", "sequence");
CREATE INDEX "nurture_enrollments_status_nextSendAt_idx" ON "nurture_enrollments"("status", "nextSendAt");
CREATE INDEX "nurture_enrollments_leadId_idx" ON "nurture_enrollments"("leadId");

CREATE TABLE "nurture_events" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "email" TEXT,
    "kind" TEXT NOT NULL,
    "path" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nurture_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "nurture_events_email_kind_createdAt_idx" ON "nurture_events"("email", "kind", "createdAt");
CREATE INDEX "nurture_events_leadId_kind_idx" ON "nurture_events"("leadId", "kind");
CREATE INDEX "nurture_events_kind_createdAt_idx" ON "nurture_events"("kind", "createdAt");

CREATE TABLE "nurture_saved_roles" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "jobId" TEXT,
    "href" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nurture_saved_roles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "nurture_saved_roles_leadId_createdAt_idx" ON "nurture_saved_roles"("leadId", "createdAt");

ALTER TABLE "nurture_leads" ADD CONSTRAINT "nurture_leads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nurture_preferences" ADD CONSTRAINT "nurture_preferences_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "nurture_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "nurture_enrollments" ADD CONSTRAINT "nurture_enrollments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "nurture_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "nurture_events" ADD CONSTRAINT "nurture_events_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "nurture_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nurture_saved_roles" ADD CONSTRAINT "nurture_saved_roles_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "nurture_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nurture_leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nurture_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nurture_enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nurture_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nurture_saved_roles" ENABLE ROW LEVEL SECURITY;
