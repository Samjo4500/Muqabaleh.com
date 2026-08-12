-- Supabase Security Advisor: rls_disabled_in_public + sensitive_columns_exposed
--
-- Muqabaleh uses Prisma with the database role (bypasses RLS). PostgREST
-- (anon / authenticated) must not read or write application tables.
-- Enable RLS with no permissive policies → API exposure is denied by default.
-- Do NOT use FORCE ROW LEVEL SECURITY (would break the table-owner Prisma role).

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.relname AS tablename
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND NOT c.relrowsecurity
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- Explicit list covers advisor-flagged tables even if the loop was a no-op
-- (e.g. already enabled). IF EXISTS keeps this safe on partial schemas.
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'User',
    'Company',
    'CompanyPanel',
    'Interview',
    'Message',
    'Payment',
    'Question',
    'PaypalSubscription',
    'B2BJob',
    'MediaAsset',
    'JobApplication',
    'JeannieProfile',
    'JeannieDocument',
    'ListedCompany',
    'ListedJob',
    'JobMockInterview',
    'ManualApplication',
    'JobFetchLog',
    'AuditLog',
    'Interviewer',
    'InterviewerAvailability',
    'HumanBooking',
    'InterviewerReview',
    'InterviewerPayout',
    'AdminLog',
    'EmailQueue',
    'CandidatePool',
    'admin_roles',
    'admin_role_assignments',
    'audit_logs',
    'partner_applications',
    'partners',
    'partner_api_keys',
    'partner_webhooks',
    'partner_webhook_deliveries',
    'partner_payouts',
    'partner_invoices',
    'interview_templates',
    'question_bank',
    'scoring_rubrics',
    'email_templates',
    'notification_logs',
    'api_keys',
    'backup_logs',
    'support_tickets',
    'ai_api_usage',
    'admin_settings',
    'interview_prequal',
    'interview_questions',
    'interview_sessions',
    'interview_responses',
    'Organization',
    'OrganizationMember',
    'JobPosting',
    'PipelineStage',
    'marketing_contacts',
    '_prisma_migrations'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- Strip PostgREST table/sequence grants so anon/authenticated cannot touch
-- public data even if a permissive policy is added later by mistake.
-- Schema USAGE is left intact for Supabase internals / PostgREST bootstrap.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated';
  ELSIF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon';
  ELSIF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM authenticated';
  END IF;
END $$;
