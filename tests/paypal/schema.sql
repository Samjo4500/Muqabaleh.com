-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'INTERVIEWER', 'ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'PARTNER_ADMIN', 'PARTNER_MEMBER');

-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('FREE', 'BASIC', 'PRO', 'PREMIUM', 'UNLIMITED', 'JEANNIE', 'JEANNIE_PRO', 'MASTERY_PACK');

-- CreateEnum
CREATE TYPE "ListedJobSource" AS ENUM ('EMPLOYER_POSTED', 'GREENHOUSE', 'LEVER', 'WORKABLE', 'RECRUITEE', 'ASHBY');

-- CreateEnum
CREATE TYPE "ManualApplicationStatus" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobMockType" AS ENUM ('COMPANY_SPECIFIC', 'BEHAVIORAL', 'TECHNICAL', 'GENERAL');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InterviewerStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('AI_PACKAGE', 'BOOKING', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobPostingStatus" AS ENUM ('DRAFT', 'OPEN', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('NEW', 'REVIEWING', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "OrgTenantType" AS ENUM ('EMPLOYER', 'AGENCY', 'ACADEMY');

-- CreateEnum
CREATE TYPE "OrgPlan" AS ENUM ('STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "OrgMemberRole" AS ENUM ('OWNER', 'ADMIN', 'HIRING_MANAGER', 'REVIEWER', 'INTERVIEWER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "experience" TEXT,
    "interviewerGender" TEXT NOT NULL DEFAULT 'MALE',
    "language" TEXT NOT NULL DEFAULT 'AR',
    "accountType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "companyId" TEXT,
    "partnerId" TEXT,
    "sessionsLeft" INTEGER NOT NULL DEFAULT 1,
    "tier" "UserTier" NOT NULL DEFAULT 'FREE',
    "cvStudioEnabled" BOOLEAN NOT NULL DEFAULT false,
    "coverLetterAiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "masteryMocksLeft" INTEGER NOT NULL DEFAULT 0,
    "subscriptionExpiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "passwordResetToken" TEXT,
    "passwordResetExpiry" TIMESTAMP(3),
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL DEFAULT 'SMALL',
    "industry" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'B2B_STARTER',
    "credits" INTEGER NOT NULL DEFAULT 0,
    "slaHours" INTEGER NOT NULL DEFAULT 72,
    "partnerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPanel" (
    "companyId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,

    CONSTRAINT "CompanyPanel_pkey" PRIMARY KEY ("companyId","interviewerId")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "guestToken" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'AI',
    "type" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "experience" TEXT,
    "position" TEXT,
    "language" TEXT NOT NULL DEFAULT 'AR',
    "interviewerGender" TEXT NOT NULL DEFAULT 'MALE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "overallScore" INTEGER,
    "contentScore" INTEGER,
    "clarityScore" INTEGER,
    "confidenceScore" INTEGER,
    "culturalFitScore" INTEGER,
    "feedback" TEXT,
    "strengths" TEXT,
    "improvements" TEXT,
    "recommendation" TEXT,
    "sessionDebited" BOOLEAN NOT NULL DEFAULT false,
    "verificationId" TEXT,
    "pdfUrl" TEXT,
    "b2bJobId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paypalOrderId" TEXT,
    "paypalSubscriptionId" TEXT,
    "bookingId" TEXT,
    "packageType" TEXT,
    "sessionsCredited" INTEGER NOT NULL DEFAULT 0,
    "idempotencyKey" TEXT,
    "companyId" TEXT,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "textAr" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaypalSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paypalSubscriptionId" TEXT NOT NULL,
    "paypalPlanId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startTime" TIMESTAMP(3),
    "nextBillingTime" TIMESTAMP(3),
    "payerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaypalSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "B2BJob" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "industry" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'AI',
    "assignmentMode" TEXT NOT NULL DEFAULT 'AUTO',
    "mustAskQuestions" TEXT,
    "humanPriceUsdCents" INTEGER,
    "inviteDeadline" TIMESTAMP(3),
    "description" TEXT,
    "descriptionAr" TEXT,
    "requirements" TEXT,
    "benefits" TEXT,
    "location" TEXT,
    "city" TEXT,
    "country" TEXT,
    "department" TEXT,
    "employmentType" TEXT NOT NULL DEFAULT 'fulltime',
    "careerLevel" TEXT,
    "salaryRange" TEXT,
    "tags" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "JobPostingStatus" NOT NULL DEFAULT 'DRAFT',
    "closesAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "B2BJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "kind" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "stage" "ApplicationStage" NOT NULL DEFAULT 'NEW',
    "coverLetter" TEXT,
    "cvAssetId" TEXT,
    "photoAssetId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'DIRECT',
    "employerNote" TEXT,
    "meta" JSONB,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JeannieProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seniority" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minSalary" INTEGER,
    "workModes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JeannieProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JeannieDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentAr" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JeannieDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListedCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ats" TEXT,
    "country" TEXT NOT NULL,
    "industry" TEXT,
    "logoUrl" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListedCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListedJob" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "department" TEXT,
    "employmentType" TEXT,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "applyUrl" TEXT NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT,
    "salaryInterval" TEXT,
    "salaryLabel" TEXT,
    "source" "ListedJobSource" NOT NULL DEFAULT 'EMPLOYER_POSTED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobMockInterview" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "userId" TEXT NOT NULL,
    "type" "JobMockType" NOT NULL DEFAULT 'GENERAL',
    "transcript" TEXT,
    "audioUrl" TEXT,
    "scores" JSONB,
    "feedback" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobMockInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" "ManualApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "notes" TEXT,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobFetchLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseSize" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobFetchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "event" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interviewer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "InterviewerStatus" NOT NULL DEFAULT 'PENDING',
    "fullName" TEXT NOT NULL,
    "fullNameAr" TEXT,
    "bio" TEXT,
    "bioAr" TEXT,
    "bioEn" TEXT,
    "slug" TEXT,
    "currentTitle" TEXT,
    "photoUrl" TEXT,
    "expertise" TEXT,
    "linkedInUrl" TEXT,
    "phone" TEXT,
    "yearsExperience" INTEGER NOT NULL,
    "specialties" TEXT NOT NULL,
    "industries" TEXT NOT NULL,
    "languages" TEXT NOT NULL DEFAULT 'AR',
    "priceTier" TEXT NOT NULL DEFAULT 'STANDARD',
    "hourlyRate" INTEGER NOT NULL DEFAULT 2900,
    "sessionPriceUsdCents" INTEGER,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalInterviews" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" INTEGER NOT NULL DEFAULT 0,
    "videoIntroUrl" TEXT,
    "idDocumentUrl" TEXT,
    "idVerified" BOOLEAN NOT NULL DEFAULT false,
    "payoutEmail" TEXT,
    "payoutMethod" TEXT NOT NULL DEFAULT 'PAYPAL',
    "timezone" TEXT,
    "excludedCompanies" TEXT,
    "excludedIndustries" TEXT,
    "ndaAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewerAvailability" (
    "id" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewerAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "candidateEmail" TEXT NOT NULL,
    "interviewerId" TEXT,
    "paypalOrderId" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "priceTotal" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL,
    "interviewerPayout" INTEGER NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'JITSI',
    "dailyRoomUrl" TEXT,
    "dailyRoomName" TEXT,
    "recordingUrl" TEXT,
    "earnings" INTEGER NOT NULL DEFAULT 0,
    "meetingLink" TEXT,
    "candidateNote" TEXT,
    "interviewerNotes" TEXT,
    "candidateFeedback" TEXT,
    "candidateRating" INTEGER,
    "interviewerRating" INTEGER,
    "disputeReason" TEXT,
    "cancelledBy" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HumanBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewerReview" (
    "id" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewerPayout" (
    "id" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "batchId" TEXT,
    "bookingIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paypalEmail" TEXT,
    "adminNote" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailQueue" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "from" TEXT,
    "sendAt" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_rate_limits" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidatePool" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isOptedIn" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "openToWork" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "industry" TEXT,
    "location" TEXT,
    "headline" TEXT,
    "summary" TEXT,
    "skills" TEXT,
    "yearsExperience" INTEGER,
    "phone" TEXT,
    "linkedInUrl" TEXT,
    "desiredRole" TEXT,
    "desiredLocations" TEXT,
    "cvAssetId" TEXT,
    "cvFileName" TEXT,
    "photoAssetId" TEXT,
    "muqabalehScore" DOUBLE PRECISION,
    "averageScore" DOUBLE PRECISION,
    "interviewCount" INTEGER NOT NULL DEFAULT 0,
    "languages" TEXT NOT NULL DEFAULT 'AR',
    "availability" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "workPreferences" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidatePool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_role_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_applications" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "country" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "partnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "plan" TEXT NOT NULL DEFAULT 'STARTER',
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "website" TEXT,
    "country" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#14B8A6',
    "accentColor" TEXT NOT NULL DEFAULT '#D4A843',
    "customDomain" TEXT,
    "customDomainVerified" BOOLEAN NOT NULL DEFAULT false,
    "supportEmail" TEXT,
    "fromEmailName" TEXT,
    "commissionBps" INTEGER NOT NULL DEFAULT 2000,
    "creditsPool" INTEGER NOT NULL DEFAULT 50,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_api_keys" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHint" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY['read', 'write']::TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_webhooks" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[] DEFAULT ARRAY['interview.completed', 'candidate.scored']::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastDeliveryAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_webhook_deliveries" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_payouts" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_invoices" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_templates" (
    "id" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "industry" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'MID',
    "durationMin" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_bank" (
    "id" TEXT NOT NULL,
    "textAr" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "category" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_rubrics" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "description" TEXT,
    "criteria" JSONB NOT NULL DEFAULT '[]',
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scoring_rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "subjectAr" TEXT NOT NULL,
    "subjectEn" TEXT NOT NULL,
    "bodyAr" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "keyHint" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "location" TEXT,
    "sizeBytes" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "backup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "category" TEXT,
    "createdById" TEXT,
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_api_usage" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "model" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_api_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_prequal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "targetRoleAr" TEXT,
    "seniorityLevel" TEXT NOT NULL,
    "questionTypes" TEXT[],
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

-- CreateTable
CREATE TABLE "interview_questions" (
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
    "tags" TEXT[],
    "industryContext" TEXT,
    "followUpQuestions" JSONB,
    "evaluationRubric" JSONB,
    "timeLimitSeconds" INTEGER NOT NULL,
    "coachingTips" TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "avgScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prequalId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "language" TEXT NOT NULL,
    "numQuestionsTotal" INTEGER NOT NULL,
    "numQuestionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "practiceDebited" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalDurationSeconds" INTEGER,
    "overallScore" DOUBLE PRECISION,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "actionItems" JSONB,
    "fullReport" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_responses" (
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "nurture_enrollments" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "sequence_type" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_sent_at" TIMESTAMP(3),
    "nextSendAt" TIMESTAMP(3),
    "metadata" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "nurture_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "site_visits" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "visitorKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student100_claims" (
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

-- CreateTable
CREATE TABLE "PaypalOrder" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paypalOrderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "captureId" TEXT,
    "captureStatus" TEXT,
    "payerId" TEXT,
    "merchantId" TEXT,
    "grantedAt" TIMESTAMP(3),
    "failureCode" TEXT,
    "failureDetail" TEXT,
    "refundedAt" TIMESTAMP(3),
    "refundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaypalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "User_partnerId_idx" ON "User"("partnerId");

-- CreateIndex
CREATE INDEX "User_lockedUntil_idx" ON "User"("lockedUntil");

-- CreateIndex
CREATE INDEX "Company_partnerId_idx" ON "Company"("partnerId");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_guestToken_key" ON "Interview"("guestToken");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_verificationId_key" ON "Interview"("verificationId");

-- CreateIndex
CREATE INDEX "Interview_userId_idx" ON "Interview"("userId");

-- CreateIndex
CREATE INDEX "Interview_companyId_idx" ON "Interview"("companyId");

-- CreateIndex
CREATE INDEX "Message_interviewId_idx" ON "Message"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paypalOrderId_key" ON "Payment"("paypalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_paypalOrderId_idx" ON "Payment"("paypalOrderId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_type_idx" ON "Payment"("type");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PaypalSubscription_paypalSubscriptionId_key" ON "PaypalSubscription"("paypalSubscriptionId");

-- CreateIndex
CREATE INDEX "PaypalSubscription_userId_idx" ON "PaypalSubscription"("userId");

-- CreateIndex
CREATE INDEX "PaypalSubscription_paypalSubscriptionId_idx" ON "PaypalSubscription"("paypalSubscriptionId");

-- CreateIndex
CREATE INDEX "B2BJob_companyId_idx" ON "B2BJob"("companyId");

-- CreateIndex
CREATE INDEX "B2BJob_status_isPublic_idx" ON "B2BJob"("status", "isPublic");

-- CreateIndex
CREATE INDEX "B2BJob_city_idx" ON "B2BJob"("city");

-- CreateIndex
CREATE INDEX "B2BJob_country_idx" ON "B2BJob"("country");

-- CreateIndex
CREATE INDEX "B2BJob_department_idx" ON "B2BJob"("department");

-- CreateIndex
CREATE INDEX "B2BJob_careerLevel_idx" ON "B2BJob"("careerLevel");

-- CreateIndex
CREATE INDEX "B2BJob_industry_idx" ON "B2BJob"("industry");

-- CreateIndex
CREATE INDEX "B2BJob_employmentType_idx" ON "B2BJob"("employmentType");

-- CreateIndex
CREATE INDEX "MediaAsset_userId_idx" ON "MediaAsset"("userId");

-- CreateIndex
CREATE INDEX "MediaAsset_kind_idx" ON "MediaAsset"("kind");

-- CreateIndex
CREATE INDEX "JobApplication_jobId_stage_idx" ON "JobApplication"("jobId", "stage");

-- CreateIndex
CREATE INDEX "JobApplication_candidateId_idx" ON "JobApplication"("candidateId");

-- CreateIndex
CREATE INDEX "JobApplication_stage_idx" ON "JobApplication"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_candidateId_key" ON "JobApplication"("jobId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "JeannieProfile_userId_key" ON "JeannieProfile"("userId");

-- CreateIndex
CREATE INDEX "JeannieDocument_userId_kind_idx" ON "JeannieDocument"("userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "ListedCompany_slug_key" ON "ListedCompany"("slug");

-- CreateIndex
CREATE INDEX "ListedCompany_isActive_country_idx" ON "ListedCompany"("isActive", "country");

-- CreateIndex
CREATE INDEX "ListedCompany_ats_idx" ON "ListedCompany"("ats");

-- CreateIndex
CREATE INDEX "ListedJob_isActive_postedAt_idx" ON "ListedJob"("isActive", "postedAt");

-- CreateIndex
CREATE INDEX "ListedJob_source_idx" ON "ListedJob"("source");

-- CreateIndex
CREATE INDEX "ListedJob_location_idx" ON "ListedJob"("location");

-- CreateIndex
CREATE INDEX "ListedJob_department_idx" ON "ListedJob"("department");

-- CreateIndex
CREATE INDEX "ListedJob_salaryCurrency_salaryMin_idx" ON "ListedJob"("salaryCurrency", "salaryMin");

-- CreateIndex
CREATE UNIQUE INDEX "ListedJob_companyId_externalId_key" ON "ListedJob"("companyId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "ListedJob_companyId_slug_key" ON "ListedJob"("companyId", "slug");

-- CreateIndex
CREATE INDEX "JobMockInterview_userId_createdAt_idx" ON "JobMockInterview"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "JobMockInterview_jobId_idx" ON "JobMockInterview"("jobId");

-- CreateIndex
CREATE INDEX "ManualApplication_userId_status_idx" ON "ManualApplication"("userId", "status");

-- CreateIndex
CREATE INDEX "ManualApplication_userId_updatedAt_idx" ON "ManualApplication"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "JobFetchLog_companyId_createdAt_idx" ON "JobFetchLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "JobFetchLog_createdAt_idx" ON "JobFetchLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "Interviewer_userId_key" ON "Interviewer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Interviewer_slug_key" ON "Interviewer"("slug");

-- CreateIndex
CREATE INDEX "Interviewer_status_idx" ON "Interviewer"("status");

-- CreateIndex
CREATE INDEX "InterviewerAvailability_interviewerId_idx" ON "InterviewerAvailability"("interviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "HumanBooking_paypalOrderId_key" ON "HumanBooking"("paypalOrderId");

-- CreateIndex
CREATE INDEX "HumanBooking_userId_idx" ON "HumanBooking"("userId");

-- CreateIndex
CREATE INDEX "HumanBooking_interviewerId_idx" ON "HumanBooking"("interviewerId");

-- CreateIndex
CREATE INDEX "HumanBooking_status_idx" ON "HumanBooking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HumanBooking_interviewerId_scheduledAt_key" ON "HumanBooking"("interviewerId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewerReview_bookingId_key" ON "InterviewerReview"("bookingId");

-- CreateIndex
CREATE INDEX "InterviewerReview_interviewerId_idx" ON "InterviewerReview"("interviewerId");

-- CreateIndex
CREATE INDEX "InterviewerPayout_interviewerId_idx" ON "InterviewerPayout"("interviewerId");

-- CreateIndex
CREATE INDEX "InterviewerPayout_userId_idx" ON "InterviewerPayout"("userId");

-- CreateIndex
CREATE INDEX "InterviewerPayout_status_idx" ON "InterviewerPayout"("status");

-- CreateIndex
CREATE INDEX "InterviewerPayout_batchId_idx" ON "InterviewerPayout"("batchId");

-- CreateIndex
CREATE INDEX "AdminLog_adminEmail_idx" ON "AdminLog"("adminEmail");

-- CreateIndex
CREATE INDEX "AdminLog_action_idx" ON "AdminLog"("action");

-- CreateIndex
CREATE INDEX "EmailQueue_sent_sendAt_idx" ON "EmailQueue"("sent", "sendAt");

-- CreateIndex
CREATE UNIQUE INDEX "api_rate_limits_key_key" ON "api_rate_limits"("key");

-- CreateIndex
CREATE INDEX "api_rate_limits_resetAt_idx" ON "api_rate_limits"("resetAt");

-- CreateIndex
CREATE UNIQUE INDEX "CandidatePool_userId_key" ON "CandidatePool"("userId");

-- CreateIndex
CREATE INDEX "CandidatePool_isVisible_idx" ON "CandidatePool"("isVisible");

-- CreateIndex
CREATE INDEX "CandidatePool_openToWork_idx" ON "CandidatePool"("openToWork");

-- CreateIndex
CREATE INDEX "CandidatePool_role_idx" ON "CandidatePool"("role");

-- CreateIndex
CREATE INDEX "CandidatePool_muqabalehScore_idx" ON "CandidatePool"("muqabalehScore");

-- CreateIndex
CREATE INDEX "CandidatePool_industry_idx" ON "CandidatePool"("industry");

-- CreateIndex
CREATE INDEX "CandidatePool_location_idx" ON "CandidatePool"("location");

-- CreateIndex
CREATE INDEX "CandidatePool_workPreferences_idx" ON "CandidatePool"("workPreferences");

-- CreateIndex
CREATE UNIQUE INDEX "admin_roles_key_key" ON "admin_roles"("key");

-- CreateIndex
CREATE INDEX "admin_role_assignments_userId_idx" ON "admin_role_assignments"("userId");

-- CreateIndex
CREATE INDEX "admin_role_assignments_roleId_idx" ON "admin_role_assignments"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_role_assignments_userId_roleId_key" ON "admin_role_assignments"("userId", "roleId");

-- CreateIndex
CREATE INDEX "audit_logs_adminId_idx" ON "audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "partner_applications_partnerId_key" ON "partner_applications"("partnerId");

-- CreateIndex
CREATE INDEX "partner_applications_status_idx" ON "partner_applications"("status");

-- CreateIndex
CREATE INDEX "partner_applications_email_idx" ON "partner_applications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partners_slug_key" ON "partners"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "partners_contactEmail_key" ON "partners"("contactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "partners_customDomain_key" ON "partners"("customDomain");

-- CreateIndex
CREATE INDEX "partners_status_idx" ON "partners"("status");

-- CreateIndex
CREATE INDEX "partners_plan_idx" ON "partners"("plan");

-- CreateIndex
CREATE INDEX "partner_api_keys_partnerId_idx" ON "partner_api_keys"("partnerId");

-- CreateIndex
CREATE INDEX "partner_api_keys_keyHash_idx" ON "partner_api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "partner_webhooks_partnerId_idx" ON "partner_webhooks"("partnerId");

-- CreateIndex
CREATE INDEX "partner_webhook_deliveries_partnerId_idx" ON "partner_webhook_deliveries"("partnerId");

-- CreateIndex
CREATE INDEX "partner_webhook_deliveries_webhookId_idx" ON "partner_webhook_deliveries"("webhookId");

-- CreateIndex
CREATE INDEX "partner_payouts_partnerId_idx" ON "partner_payouts"("partnerId");

-- CreateIndex
CREATE INDEX "partner_payouts_status_idx" ON "partner_payouts"("status");

-- CreateIndex
CREATE INDEX "partner_invoices_partnerId_idx" ON "partner_invoices"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_invoices_partnerId_number_key" ON "partner_invoices"("partnerId", "number");

-- CreateIndex
CREATE INDEX "interview_templates_industry_idx" ON "interview_templates"("industry");

-- CreateIndex
CREATE INDEX "interview_templates_isActive_idx" ON "interview_templates"("isActive");

-- CreateIndex
CREATE INDEX "question_bank_industry_idx" ON "question_bank"("industry");

-- CreateIndex
CREATE INDEX "question_bank_isActive_idx" ON "question_bank"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_key_key" ON "email_templates"("key");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");

-- CreateIndex
CREATE INDEX "notification_logs_recipient_idx" ON "notification_logs"("recipient");

-- CreateIndex
CREATE INDEX "notification_logs_createdAt_idx" ON "notification_logs"("createdAt");

-- CreateIndex
CREATE INDEX "api_keys_provider_idx" ON "api_keys"("provider");

-- CreateIndex
CREATE INDEX "backup_logs_status_idx" ON "backup_logs"("status");

-- CreateIndex
CREATE INDEX "backup_logs_createdAt_idx" ON "backup_logs"("createdAt");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets"("priority");

-- CreateIndex
CREATE INDEX "support_tickets_createdById_idx" ON "support_tickets"("createdById");

-- CreateIndex
CREATE INDEX "support_tickets_assigneeId_idx" ON "support_tickets"("assigneeId");

-- CreateIndex
CREATE INDEX "ai_api_usage_provider_idx" ON "ai_api_usage"("provider");

-- CreateIndex
CREATE INDEX "ai_api_usage_createdAt_idx" ON "ai_api_usage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "admin_settings_key_key" ON "admin_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "interview_prequal_sessionId_key" ON "interview_prequal"("sessionId");

-- CreateIndex
CREATE INDEX "interview_prequal_userId_idx" ON "interview_prequal"("userId");

-- CreateIndex
CREATE INDEX "interview_prequal_sessionId_idx" ON "interview_prequal"("sessionId");

-- CreateIndex
CREATE INDEX "interview_questions_roleCategory_seniorityLevel_questionTyp_idx" ON "interview_questions"("roleCategory", "seniorityLevel", "questionType", "interviewRound");

-- CreateIndex
CREATE INDEX "interview_questions_difficulty_idx" ON "interview_questions"("difficulty");

-- CreateIndex
CREATE INDEX "interview_questions_tags_idx" ON "interview_questions"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "interview_sessions_prequalId_key" ON "interview_sessions"("prequalId");

-- CreateIndex
CREATE INDEX "interview_sessions_userId_idx" ON "interview_sessions"("userId");

-- CreateIndex
CREATE INDEX "interview_sessions_status_idx" ON "interview_sessions"("status");

-- CreateIndex
CREATE INDEX "interview_responses_sessionId_idx" ON "interview_responses"("sessionId");

-- CreateIndex
CREATE INDEX "interview_responses_questionId_idx" ON "interview_responses"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_companyId_key" ON "Organization"("companyId");

-- CreateIndex
CREATE INDEX "Organization_tenantType_idx" ON "Organization"("tenantType");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "Organization_plan_idx" ON "Organization"("plan");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE INDEX "OrganizationMember_invitedEmail_idx" ON "OrganizationMember"("invitedEmail");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_interviewSlug_key" ON "JobPosting"("interviewSlug");

-- CreateIndex
CREATE INDEX "JobPosting_organizationId_idx" ON "JobPosting"("organizationId");

-- CreateIndex
CREATE INDEX "JobPosting_status_idx" ON "JobPosting"("status");

-- CreateIndex
CREATE INDEX "JobPosting_organizationId_status_idx" ON "JobPosting"("organizationId", "status");

-- CreateIndex
CREATE INDEX "PipelineStage_organizationId_sortOrder_idx" ON "PipelineStage"("organizationId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineStage_organizationId_key_key" ON "PipelineStage"("organizationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "nurture_leads_email_key" ON "nurture_leads"("email");

-- CreateIndex
CREATE INDEX "nurture_leads_userId_idx" ON "nurture_leads"("userId");

-- CreateIndex
CREATE INDEX "nurture_leads_source_idx" ON "nurture_leads"("source");

-- CreateIndex
CREATE UNIQUE INDEX "nurture_preferences_leadId_key" ON "nurture_preferences"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "nurture_preferences_token_key" ON "nurture_preferences"("token");

-- CreateIndex
CREATE INDEX "nurture_enrollments_status_nextSendAt_idx" ON "nurture_enrollments"("status", "nextSendAt");

-- CreateIndex
CREATE INDEX "nurture_enrollments_leadId_idx" ON "nurture_enrollments"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "nurture_enrollments_leadId_sequence_type_key" ON "nurture_enrollments"("leadId", "sequence_type");

-- CreateIndex
CREATE INDEX "nurture_events_email_kind_createdAt_idx" ON "nurture_events"("email", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "nurture_events_leadId_kind_idx" ON "nurture_events"("leadId", "kind");

-- CreateIndex
CREATE INDEX "nurture_events_kind_createdAt_idx" ON "nurture_events"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "nurture_saved_roles_leadId_createdAt_idx" ON "nurture_saved_roles"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "site_visits_createdAt_idx" ON "site_visits"("createdAt");

-- CreateIndex
CREATE INDEX "site_visits_visitorKey_createdAt_idx" ON "site_visits"("visitorKey", "createdAt");

-- CreateIndex
CREATE INDEX "site_visits_path_createdAt_idx" ON "site_visits"("path", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "student100_claims_userId_key" ON "student100_claims"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student100_claims_email_key" ON "student100_claims"("email");

-- CreateIndex
CREATE INDEX "student100_claims_status_createdAt_idx" ON "student100_claims"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaypalOrder_ref_key" ON "PaypalOrder"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "PaypalOrder_paypalOrderId_key" ON "PaypalOrder"("paypalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaypalOrder_captureId_key" ON "PaypalOrder"("captureId");

-- CreateIndex
CREATE INDEX "PaypalOrder_userId_createdAt_idx" ON "PaypalOrder"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PaypalOrder_status_createdAt_idx" ON "PaypalOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_processedAt_receivedAt_idx" ON "WebhookEvent"("processedAt", "receivedAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPanel" ADD CONSTRAINT "CompanyPanel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPanel" ADD CONSTRAINT "CompanyPanel_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "Interviewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_b2bJobId_fkey" FOREIGN KEY ("b2bJobId") REFERENCES "B2BJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "HumanBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaypalSubscription" ADD CONSTRAINT "PaypalSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "B2BJob" ADD CONSTRAINT "B2BJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "B2BJob" ADD CONSTRAINT "B2BJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "B2BJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JeannieProfile" ADD CONSTRAINT "JeannieProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JeannieDocument" ADD CONSTRAINT "JeannieDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListedJob" ADD CONSTRAINT "ListedJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ListedCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMockInterview" ADD CONSTRAINT "JobMockInterview_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ListedJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMockInterview" ADD CONSTRAINT "JobMockInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualApplication" ADD CONSTRAINT "ManualApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFetchLog" ADD CONSTRAINT "JobFetchLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ListedCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interviewer" ADD CONSTRAINT "Interviewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewerAvailability" ADD CONSTRAINT "InterviewerAvailability_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "Interviewer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanBooking" ADD CONSTRAINT "HumanBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanBooking" ADD CONSTRAINT "HumanBooking_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "Interviewer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewerReview" ADD CONSTRAINT "InterviewerReview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "Interviewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewerReview" ADD CONSTRAINT "InterviewerReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "HumanBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewerPayout" ADD CONSTRAINT "InterviewerPayout_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "Interviewer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewerPayout" ADD CONSTRAINT "InterviewerPayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatePool" ADD CONSTRAINT "CandidatePool_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_role_assignments" ADD CONSTRAINT "admin_role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_role_assignments" ADD CONSTRAINT "admin_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_applications" ADD CONSTRAINT "partner_applications_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_api_keys" ADD CONSTRAINT "partner_api_keys_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_webhooks" ADD CONSTRAINT "partner_webhooks_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_webhook_deliveries" ADD CONSTRAINT "partner_webhook_deliveries_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_webhook_deliveries" ADD CONSTRAINT "partner_webhook_deliveries_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "partner_webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_payouts" ADD CONSTRAINT "partner_payouts_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_invoices" ADD CONSTRAINT "partner_invoices_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_prequal" ADD CONSTRAINT "interview_prequal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_prequalId_fkey" FOREIGN KEY ("prequalId") REFERENCES "interview_prequal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_responses" ADD CONSTRAINT "interview_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineStage" ADD CONSTRAINT "PipelineStage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurture_leads" ADD CONSTRAINT "nurture_leads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurture_preferences" ADD CONSTRAINT "nurture_preferences_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "nurture_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurture_enrollments" ADD CONSTRAINT "nurture_enrollments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "nurture_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurture_events" ADD CONSTRAINT "nurture_events_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "nurture_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurture_saved_roles" ADD CONSTRAINT "nurture_saved_roles_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "nurture_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student100_claims" ADD CONSTRAINT "student100_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaypalOrder" ADD CONSTRAINT "PaypalOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

