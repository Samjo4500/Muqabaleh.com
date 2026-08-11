import { DEFAULT_PIPELINE_STAGES, defaultQuestionsForRole, scoreToGrade } from './defaults';
import type {
  AcademyCohort,
  AgencyClient,
  ConsoleApiKey,
  ConsoleDashboard,
  ConsoleJobPosting,
  ConsoleMember,
  ConsoleOrganization,
  ConsolePassport,
  ConsolePipelineStage,
  ConsoleWebhook,
  TenantBundle,
} from './types';

export const DEMO_ORG_ID = 'org-demo-najm';
export const DEMO_ORG_SLUG = 'najm-tech';
export const DEMO_AGENCY_SLUG = 'atlas-agency';
export const DEMO_ACADEMY_SLUG = 'bayan-university';
export const DEMO_OWNER_USER_ID = 'user-console-demo-owner';

function isoHoursAgo(h: number) {
  return new Date(Date.now() - h * 3600000).toISOString();
}
function isoDaysFromNow(d: number) {
  return new Date(Date.now() + d * 86400000).toISOString();
}

function stagesFor(orgId: string): ConsolePipelineStage[] {
  return DEFAULT_PIPELINE_STAGES.map((s, i) => ({
    ...s,
    id: `stage-${orgId}-${s.key.toLowerCase()}`,
    organizationId: orgId,
    sortOrder: i,
  }));
}

function makePassport(
  orgId: string,
  partial: Omit<
    ConsolePassport,
    'grade' | 'organizationId' | 'verifyUrl' | 'competencies' | 'insights'
  > & {
    competencies?: ConsolePassport['competencies'];
    insights?: ConsolePassport['insights'];
  },
): ConsolePassport {
  const score = partial.score;
  return {
    organizationId: orgId,
    grade: scoreToGrade(score),
    verifyUrl: `https://muqabaleh.com/verify/${partial.id}`,
    competencies: partial.competencies || [
      { axis: 'Clarity', axisAr: 'الوضوح', score: Math.min(100, score + 4), benchmark: 70 },
      { axis: 'Structure', axisAr: 'البنية', score: Math.max(0, score - 6), benchmark: 70 },
      { axis: 'Depth', axisAr: 'العمق', score: score, benchmark: 70 },
      { axis: 'Confidence', axisAr: 'الثقة', score: Math.min(100, score + 8), benchmark: 70 },
      { axis: 'Role Fit', axisAr: 'ملاءمة الدور', score: Math.max(0, score - 3), benchmark: 70 },
    ],
    insights: partial.insights || {
      summary: 'Solid communicator with clear examples.',
      summaryAr: 'متواصل قوي مع أمثلة واضحة.',
      greenFlags: ['Clear STAR examples'],
      greenFlagsAr: ['أمثلة STAR واضحة'],
      redFlags: score < 60 ? ['Needs depth'] : [],
      redFlagsAr: score < 60 ? ['يحتاج عمقاً'] : [],
    },
    ...partial,
  };
}

function employerBundle(): TenantBundle {
  const orgId = DEMO_ORG_ID;
  const q = defaultQuestionsForRole('software_engineer');
  return {
    org: {
      id: orgId,
      slug: DEMO_ORG_SLUG,
      name: 'Najm Tech',
      tenantType: 'EMPLOYER',
      plan: 'PRO',
      industry: 'Technology',
      size: '51-200',
      country: 'SA',
      companyId: null,
      whiteLabel: {
        logoUrl: '/images/logos/muqabaleh-wordmark.webp',
        primaryColor: '#14B8A6',
        font: 'Inter',
        customDomain: null,
        fromEmail: 'hiring@najm.demo',
      },
      status: 'ACTIVE',
    },
    members: [
      {
        id: 'mem-najm-owner',
        organizationId: orgId,
        userId: DEMO_OWNER_USER_ID,
        role: 'OWNER',
        invitedEmail: 'owner@najm.demo',
        invitedName: 'Sara Al-Rashid',
        status: 'ACTIVE',
        name: 'Sara Al-Rashid',
        email: 'owner@najm.demo',
        lastActiveAt: isoHoursAgo(1),
      },
      {
        id: 'mem-najm-hm',
        organizationId: orgId,
        userId: 'user-najm-hm',
        role: 'HIRING_MANAGER',
        invitedEmail: 'hiring@najm.demo',
        invitedName: 'Omar Faris',
        status: 'ACTIVE',
        name: 'Omar Faris',
        email: 'hiring@najm.demo',
        lastActiveAt: isoHoursAgo(5),
      },
    ],
    stages: stagesFor(orgId),
    jobs: [
      {
        id: 'job-demo-swe',
        organizationId: orgId,
        title: 'Software Engineer',
        titleAr: 'مهندس برمجيات',
        roleKey: 'software_engineer',
        difficulty: 'MID',
        language: 'MIXED',
        questions: q,
        branding: {
          welcomeMsg: 'Welcome to Najm Tech screening.',
          welcomeMsgAr: 'مرحباً بك في فحص نجم تك.',
        },
        interviewSlug: 'najm-swe-2026',
        expiresAt: isoDaysFromNow(30),
        maxAttempts: 2,
        status: 'OPEN',
        createdAt: isoHoursAgo(240),
        applicantCount: 4,
      },
    ],
    passports: [
      makePassport(orgId, {
        id: 'pass-demo-1',
        candidateName: 'Khalid Al-Amri',
        candidateNameAr: 'خالد العمري',
        candidateEmail: 'khalid.amri@example.com',
        avatarUrl: null,
        role: 'Software Engineer',
        roleAr: 'مهندس برمجيات',
        score: 78,
        stageKey: 'REVIEWED',
        jobId: 'job-demo-swe',
        jobTitle: 'Software Engineer',
        submittedAt: isoHoursAgo(2),
        transcript: [
          {
            q: 'Walk me through a recent project.',
            a: 'Shipped a payments service that cut latency 30%.',
          },
        ],
        notes: [],
        tags: ['demo'],
      }),
      makePassport(orgId, {
        id: 'pass-demo-2',
        candidateName: 'Noura Al-Subaie',
        candidateNameAr: 'نورة السبيعي',
        candidateEmail: 'noura.subaie@example.com',
        avatarUrl: null,
        role: 'Marketing Manager',
        roleAr: 'مديرة تسويق',
        score: 65,
        stageKey: 'NEW',
        jobId: 'job-demo-swe',
        jobTitle: 'Marketing Manager',
        submittedAt: isoHoursAgo(8),
        transcript: [],
        notes: [],
        tags: ['demo'],
      }),
      makePassport(orgId, {
        id: 'pass-demo-3',
        candidateName: 'Fahad Al-Dosari',
        candidateNameAr: 'فهد الدوسري',
        candidateEmail: 'fahad.dosari@example.com',
        avatarUrl: null,
        role: 'Data Analyst',
        roleAr: 'محلل بيانات',
        score: 52,
        stageKey: 'REJECTED',
        jobId: 'job-demo-swe',
        jobTitle: 'Data Analyst',
        submittedAt: isoHoursAgo(20),
        transcript: [],
        notes: [],
        tags: ['demo'],
      }),
    ],
    clients: [],
    cohorts: [],
    apiKeys: [
      {
        id: 'key-najm-1',
        organizationId: orgId,
        name: 'Production',
        prefix: 'mq_live_najm',
        createdAt: isoHoursAgo(720),
        lastUsedAt: isoHoursAgo(3),
        revoked: false,
      },
    ],
    webhooks: [
      {
        id: 'wh-najm-1',
        organizationId: orgId,
        url: 'https://hooks.najm.demo/muqabaleh',
        events: ['passport.received', 'candidate.shortlisted', 'interview.completed'],
        active: true,
        createdAt: isoHoursAgo(400),
      },
    ],
  };
}

function agencyBundle(): TenantBundle {
  const orgId = 'org-demo-atlas';
  const clients: AgencyClient[] = [
    {
      id: 'cli-1',
      organizationId: orgId,
      name: 'Horizon Retail',
      slug: 'horizon-retail',
      industry: 'Retail',
      logoUrl: null,
      primaryColor: '#0EA5E9',
      contactEmail: 'hr@horizon.demo',
      interviewsVolume: 42,
      revenueUsd: 8400,
      commissionBps: 2000,
      candidateCount: 38,
      status: 'ACTIVE',
    },
    {
      id: 'cli-2',
      organizationId: orgId,
      name: 'Desert Logistics',
      slug: 'desert-logistics',
      industry: 'Logistics',
      logoUrl: null,
      primaryColor: '#F59E0B',
      contactEmail: 'talent@desert.demo',
      interviewsVolume: 27,
      revenueUsd: 5400,
      commissionBps: 2500,
      candidateCount: 22,
      status: 'ACTIVE',
    },
    {
      id: 'cli-3',
      organizationId: orgId,
      name: 'Pearl Finance',
      slug: 'pearl-finance',
      industry: 'Finance',
      logoUrl: null,
      primaryColor: '#14B8A6',
      contactEmail: 'careers@pearl.demo',
      interviewsVolume: 15,
      revenueUsd: 3750,
      commissionBps: 1800,
      candidateCount: 14,
      status: 'PAUSED',
    },
  ];

  return {
    org: {
      id: orgId,
      slug: DEMO_AGENCY_SLUG,
      name: 'Atlas Agency',
      tenantType: 'AGENCY',
      plan: 'ENTERPRISE',
      industry: 'Staffing',
      size: '11-50',
      country: 'AE',
      companyId: null,
      whiteLabel: {
        logoUrl: '/images/logos/muqabaleh-wordmark.webp',
        primaryColor: '#14B8A6',
        font: 'Cairo',
        fromEmail: 'desk@atlas.demo',
      },
      status: 'ACTIVE',
    },
    members: [
      {
        id: 'mem-atlas-owner',
        organizationId: orgId,
        userId: 'user-atlas-owner',
        role: 'OWNER',
        invitedEmail: 'owner@atlas.demo',
        invitedName: 'Layla Hassan',
        status: 'ACTIVE',
        name: 'Layla Hassan',
        email: 'owner@atlas.demo',
        lastActiveAt: isoHoursAgo(2),
      },
    ],
    stages: stagesFor(orgId),
    jobs: [
      {
        id: 'job-atlas-ops',
        organizationId: orgId,
        title: 'Operations Associate',
        titleAr: 'مساعد عمليات',
        roleKey: 'operations_manager',
        difficulty: 'JUNIOR',
        language: 'AR',
        questions: defaultQuestionsForRole('operations_manager'),
        branding: null,
        interviewSlug: 'atlas-ops-2026',
        expiresAt: isoDaysFromNow(21),
        maxAttempts: 2,
        status: 'OPEN',
        createdAt: isoHoursAgo(100),
        applicantCount: 12,
      },
    ],
    passports: [
      makePassport(orgId, {
        id: 'pass-atlas-1',
        candidateName: 'Rami Odeh',
        candidateEmail: 'rami@example.com',
        avatarUrl: null,
        role: 'Operations Associate',
        score: 81,
        stageKey: 'SHORTLISTED',
        jobId: 'job-atlas-ops',
        jobTitle: 'Operations Associate',
        submittedAt: isoHoursAgo(4),
        transcript: [],
        notes: [],
        tags: ['demo', 'horizon-retail'],
      }),
      makePassport(orgId, {
        id: 'pass-atlas-2',
        candidateName: 'Maya Khalil',
        candidateEmail: 'maya@example.com',
        avatarUrl: null,
        role: 'Operations Associate',
        score: 69,
        stageKey: 'NEW',
        jobId: 'job-atlas-ops',
        jobTitle: 'Operations Associate',
        submittedAt: isoHoursAgo(11),
        transcript: [],
        notes: [],
        tags: ['demo', 'desert-logistics'],
      }),
    ],
    clients,
    cohorts: [],
    apiKeys: [
      {
        id: 'key-atlas-1',
        organizationId: orgId,
        name: 'Agency API',
        prefix: 'mq_live_atlas',
        createdAt: isoHoursAgo(500),
        lastUsedAt: isoHoursAgo(12),
        revoked: false,
      },
    ],
    webhooks: [
      {
        id: 'wh-atlas-1',
        organizationId: orgId,
        url: 'https://hooks.atlas.demo/passports',
        events: ['passport.received', 'interview.completed'],
        active: true,
        createdAt: isoHoursAgo(300),
      },
    ],
  };
}

function academyBundle(): TenantBundle {
  const orgId = 'org-demo-bayan';
  const cohorts: AcademyCohort[] = [
    {
      id: 'coh-cs-2026',
      organizationId: orgId,
      name: 'CS Senior Track',
      major: 'Computer Science',
      year: '2026',
      deadline: isoDaysFromNow(45),
      facultyEmail: 'dr.noura@bayan.demo',
      students: [
        {
          id: 'stu-1',
          name: 'Aisha Rahman',
          email: 'aisha@bayan.edu',
          studentId: 'BAY-1001',
          major: 'Computer Science',
          year: '2026',
          score: 88,
          shareWithCareerCenter: true,
          status: 'COMPLETED',
        },
        {
          id: 'stu-2',
          name: 'Hassan Ali',
          email: 'hassan@bayan.edu',
          studentId: 'BAY-1002',
          major: 'Computer Science',
          year: '2026',
          score: 74,
          shareWithCareerCenter: false,
          status: 'COMPLETED',
        },
        {
          id: 'stu-3',
          name: 'Dina Saleh',
          email: 'dina@bayan.edu',
          studentId: 'BAY-1003',
          major: 'Computer Science',
          year: '2026',
          score: null,
          shareWithCareerCenter: false,
          status: 'INVITED',
        },
      ],
    },
    {
      id: 'coh-biz-2027',
      organizationId: orgId,
      name: 'Business Juniors',
      major: 'Business Administration',
      year: '2027',
      deadline: isoDaysFromNow(60),
      facultyEmail: 'prof.kareem@bayan.demo',
      students: [
        {
          id: 'stu-4',
          name: 'Omar Latif',
          email: 'omar@bayan.edu',
          studentId: 'BAY-2001',
          major: 'Business Administration',
          year: '2027',
          score: 67,
          shareWithCareerCenter: true,
          status: 'COMPLETED',
        },
        {
          id: 'stu-5',
          name: 'Lina Farouq',
          email: 'lina@bayan.edu',
          studentId: 'BAY-2002',
          major: 'Business Administration',
          year: '2027',
          score: null,
          shareWithCareerCenter: false,
          status: 'STARTED',
        },
      ],
    },
  ];

  return {
    org: {
      id: orgId,
      slug: DEMO_ACADEMY_SLUG,
      name: 'Bayan University',
      tenantType: 'ACADEMY',
      plan: 'PRO',
      industry: 'Higher Education',
      size: '1000+',
      country: 'SA',
      companyId: null,
      whiteLabel: {
        logoUrl: '/images/logos/muqabaleh-wordmark.webp',
        primaryColor: '#14B8A6',
        font: 'IBM Plex Sans Arabic',
        fromEmail: 'careers@bayan.demo',
      },
      status: 'ACTIVE',
    },
    members: [
      {
        id: 'mem-bayan-owner',
        organizationId: orgId,
        userId: 'user-bayan-owner',
        role: 'OWNER',
        invitedEmail: 'careers@bayan.demo',
        invitedName: 'Dean Career Center',
        status: 'ACTIVE',
        name: 'Dean Career Center',
        email: 'careers@bayan.demo',
        lastActiveAt: isoHoursAgo(6),
      },
      {
        id: 'mem-bayan-fac',
        organizationId: orgId,
        userId: 'user-bayan-fac',
        role: 'REVIEWER',
        invitedEmail: 'dr.noura@bayan.demo',
        invitedName: 'Dr. Noura',
        status: 'ACTIVE',
        name: 'Dr. Noura',
        email: 'dr.noura@bayan.demo',
        lastActiveAt: isoHoursAgo(20),
      },
    ],
    stages: stagesFor(orgId),
    jobs: [
      {
        id: 'job-bayan-track',
        organizationId: orgId,
        title: 'Career Readiness Interview',
        titleAr: 'مقابلة الجاهزية المهنية',
        roleKey: 'business_analyst',
        difficulty: 'ENTRY',
        language: 'MIXED',
        questions: defaultQuestionsForRole('business_analyst'),
        branding: null,
        interviewSlug: 'bayan-ready-2026',
        expiresAt: isoDaysFromNow(45),
        maxAttempts: 2,
        status: 'OPEN',
        createdAt: isoHoursAgo(200),
        applicantCount: 5,
      },
    ],
    passports: [
      makePassport(orgId, {
        id: 'pass-bayan-1',
        candidateName: 'Aisha Rahman',
        candidateEmail: 'aisha@bayan.edu',
        avatarUrl: null,
        role: 'Career Readiness',
        score: 88,
        stageKey: 'REVIEWED',
        jobId: 'job-bayan-track',
        jobTitle: 'Career Readiness Interview',
        submittedAt: isoHoursAgo(18),
        private: false,
        transcript: [],
        notes: [],
        tags: ['demo', 'cs-2026'],
      }),
      makePassport(orgId, {
        id: 'pass-bayan-2',
        candidateName: 'Hassan Ali',
        candidateEmail: 'hassan@bayan.edu',
        avatarUrl: null,
        role: 'Career Readiness',
        score: 74,
        stageKey: 'NEW',
        jobId: 'job-bayan-track',
        jobTitle: 'Career Readiness Interview',
        submittedAt: isoHoursAgo(40),
        private: true,
        transcript: [],
        notes: [],
        tags: ['demo', 'cs-2026', 'private'],
      }),
    ],
    clients: [],
    cohorts,
    apiKeys: [],
    webhooks: [],
  };
}

const INITIAL: Record<string, TenantBundle> = {
  [DEMO_ORG_SLUG]: employerBundle(),
  [DEMO_AGENCY_SLUG]: agencyBundle(),
  [DEMO_ACADEMY_SLUG]: academyBundle(),
};

/** Mutable multi-tenant demo store keyed by slug */
export const demoTenants: Record<string, TenantBundle> = {
  [DEMO_ORG_SLUG]: employerBundle(),
  [DEMO_AGENCY_SLUG]: agencyBundle(),
  [DEMO_ACADEMY_SLUG]: academyBundle(),
};

/** @deprecated use demoTenants[DEMO_ORG_SLUG] — kept for Phase 1 imports */
export const demoConsoleStore = {
  get org() {
    return demoTenants[DEMO_ORG_SLUG].org;
  },
  set org(v: ConsoleOrganization) {
    demoTenants[DEMO_ORG_SLUG].org = v;
  },
  get members() {
    return demoTenants[DEMO_ORG_SLUG].members;
  },
  set members(v: ConsoleMember[]) {
    demoTenants[DEMO_ORG_SLUG].members = v;
  },
  get stages() {
    return demoTenants[DEMO_ORG_SLUG].stages;
  },
  get jobs() {
    return demoTenants[DEMO_ORG_SLUG].jobs;
  },
  set jobs(v: ConsoleJobPosting[]) {
    demoTenants[DEMO_ORG_SLUG].jobs = v;
  },
  get passports() {
    return demoTenants[DEMO_ORG_SLUG].passports;
  },
  set passports(v: ConsolePassport[]) {
    demoTenants[DEMO_ORG_SLUG].passports = v;
  },
};

export function isDemoSlug(slug: string): boolean {
  return slug in demoTenants;
}

export function getDemoBundle(slug: string): TenantBundle | null {
  return demoTenants[slug] || null;
}

export function getDemoBundleByOrgId(orgId: string): TenantBundle | null {
  return Object.values(demoTenants).find((b) => b.org.id === orgId) || null;
}

export function resetConsoleDemo() {
  demoTenants[DEMO_ORG_SLUG] = employerBundle();
  demoTenants[DEMO_AGENCY_SLUG] = agencyBundle();
  demoTenants[DEMO_ACADEMY_SLUG] = academyBundle();
}

/** Remove demo-tagged passports for one tenant (irreversible in-session). */
export function clearDemoPassports(slug: string): number {
  const bundle = demoTenants[slug];
  if (!bundle) return 0;
  const before = bundle.passports.length;
  bundle.passports = bundle.passports.filter((p) => !p.tags?.includes('demo'));
  return before - bundle.passports.length;
}

export function buildDemoDashboard(orgId: string): ConsoleDashboard {
  const bundle = getDemoBundleByOrgId(orgId);
  if (!bundle) {
    return {
      kpis: { passportsReceived: 0, avgScore: 0, interviewsCompleted: 0, timeSavedHours: 0 },
      feed: [],
      pipelineCounts: {},
    };
  }
  const passports = bundle.passports.filter((p) => p.organizationId === orgId);
  const completed = passports.length;
  const avg =
    completed === 0
      ? 0
      : Math.round(passports.reduce((s, p) => s + p.score, 0) / completed);
  const pipelineCounts: Record<string, number> = {};
  for (const s of bundle.stages) pipelineCounts[s.key] = 0;
  for (const p of passports) {
    pipelineCounts[p.stageKey] = (pipelineCounts[p.stageKey] || 0) + 1;
  }
  return {
    kpis: {
      passportsReceived: completed,
      avgScore: avg,
      interviewsCompleted: completed,
      timeSavedHours: Math.round(completed * 1.8),
    },
    feed: [...passports].sort(
      (a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt),
    ),
    pipelineCounts,
  };
}

export type { ConsoleApiKey, ConsoleWebhook, AgencyClient, AcademyCohort };
