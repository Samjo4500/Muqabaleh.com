-- Employer Console Phase 1: Organization tenants + job builder + pipeline stages
-- Minimal additive schema. Agency/Academy modules use tenantType later.

CREATE TYPE "OrgTenantType" AS ENUM ('EMPLOYER', 'AGENCY', 'ACADEMY');
CREATE TYPE "OrgPlan" AS ENUM ('STARTER', 'PRO', 'ENTERPRISE');
CREATE TYPE "OrgMemberRole" AS ENUM ('OWNER', 'ADMIN', 'HIRING_MANAGER', 'REVIEWER', 'INTERVIEWER');

ALTER TABLE "JobApplication" ADD COLUMN IF NOT EXISTS "meta" JSONB;

CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantType" "OrgTenantType" NOT NULL DEFAULT 'EMPLOYER',
    "plan" "OrgPlan" NOT NULL DEFAULT 'STARTER',
    "industry" TEXT,
    "size" TEXT,
    "country" TEXT,
    "companyId" TEXT,
    "whiteLabel" JSONB,
    "settings" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE UNIQUE INDEX "Organization_companyId_key" ON "Organization"("companyId");
CREATE INDEX "Organization_tenantType_idx" ON "Organization"("tenantType");
CREATE INDEX "Organization_status_idx" ON "Organization"("status");
CREATE INDEX "Organization_plan_idx" ON "Organization"("plan");

CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "role" "OrgMemberRole" NOT NULL DEFAULT 'REVIEWER',
    "invitedEmail" TEXT,
    "invitedName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");
CREATE INDEX "OrganizationMember_invitedEmail_idx" ON "OrganizationMember"("invitedEmail");
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "roleKey" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MID',
    "language" TEXT NOT NULL DEFAULT 'MIXED',
    "questions" JSONB NOT NULL,
    "branding" JSONB,
    "interviewSlug" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "status" "JobPostingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobPosting_interviewSlug_key" ON "JobPosting"("interviewSlug");
CREATE INDEX "JobPosting_organizationId_idx" ON "JobPosting"("organizationId");
CREATE INDEX "JobPosting_status_idx" ON "JobPosting"("status");
CREATE INDEX "JobPosting_organizationId_status_idx" ON "JobPosting"("organizationId", "status");

CREATE TABLE "PipelineStage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineStage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PipelineStage_organizationId_sortOrder_idx" ON "PipelineStage"("organizationId", "sortOrder");
CREATE UNIQUE INDEX "PipelineStage_organizationId_key_key" ON "PipelineStage"("organizationId", "key");

ALTER TABLE "Organization" ADD CONSTRAINT "Organization_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PipelineStage" ADD CONSTRAINT "PipelineStage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
