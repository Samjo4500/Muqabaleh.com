import { DEFAULT_PIPELINE_STAGES, defaultQuestionsForRole, scoreToGrade } from './defaults';
import type {
  ConsoleDashboard,
  ConsoleJobPosting,
  ConsoleMember,
  ConsoleOrganization,
  ConsolePassport,
  ConsolePipelineStage,
} from './types';

export const DEMO_ORG_ID = 'org-demo-najm';
export const DEMO_ORG_SLUG = 'najm-tech';
export const DEMO_OWNER_USER_ID = 'user-console-demo-owner';

function isoHoursAgo(h: number) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

function isoDaysFromNow(d: number) {
  return new Date(Date.now() + d * 86400000).toISOString();
}

export const DEMO_ORG: ConsoleOrganization = {
  id: DEMO_ORG_ID,
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
    faviconUrl: null,
  },
  status: 'ACTIVE',
};

export const DEMO_STAGES: ConsolePipelineStage[] = DEFAULT_PIPELINE_STAGES.map(
  (s, i) => ({
    ...s,
    id: `stage-demo-${s.key.toLowerCase()}`,
    organizationId: DEMO_ORG_ID,
    sortOrder: i,
  }),
);

export const DEMO_MEMBERS: ConsoleMember[] = [
  {
    id: 'mem-demo-owner',
    organizationId: DEMO_ORG_ID,
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
    id: 'mem-demo-hm',
    organizationId: DEMO_ORG_ID,
    userId: 'user-console-demo-hm',
    role: 'HIRING_MANAGER',
    invitedEmail: 'hiring@najm.demo',
    invitedName: 'Omar Faris',
    status: 'ACTIVE',
    name: 'Omar Faris',
    email: 'hiring@najm.demo',
    lastActiveAt: isoHoursAgo(5),
  },
  {
    id: 'mem-demo-rev',
    organizationId: DEMO_ORG_ID,
    userId: 'user-console-demo-rev',
    role: 'REVIEWER',
    invitedEmail: 'review@najm.demo',
    invitedName: 'Lina Haddad',
    status: 'ACTIVE',
    name: 'Lina Haddad',
    email: 'review@najm.demo',
    lastActiveAt: isoHoursAgo(26),
  },
];

const qSw = defaultQuestionsForRole('software_engineer');
const qPm = defaultQuestionsForRole('product_manager');

export let DEMO_JOBS: ConsoleJobPosting[] = [
  {
    id: 'job-demo-swe',
    organizationId: DEMO_ORG_ID,
    title: 'Software Engineer',
    titleAr: 'مهندس برمجيات',
    roleKey: 'software_engineer',
    difficulty: 'MID',
    language: 'MIXED',
    questions: qSw,
    branding: {
      logoUrl: '/images/logos/muqabaleh-wordmark.webp',
      welcomeMsg: 'Welcome to Najm Tech screening.',
      welcomeMsgAr: 'مرحباً بك في فحص نجم تك.',
      outroMsg: 'Thank you — we will review your passport shortly.',
      outroMsgAr: 'شكراً لك — سنراجع جوازك قريباً.',
    },
    interviewSlug: 'najm-swe-2026',
    expiresAt: isoDaysFromNow(30),
    maxAttempts: 2,
    status: 'OPEN',
    createdAt: isoHoursAgo(240),
    applicantCount: 4,
  },
  {
    id: 'job-demo-pm',
    organizationId: DEMO_ORG_ID,
    title: 'Product Manager',
    titleAr: 'مدير منتج',
    roleKey: 'product_manager',
    difficulty: 'SENIOR',
    language: 'EN',
    questions: qPm,
    branding: null,
    interviewSlug: 'najm-pm-2026',
    expiresAt: isoDaysFromNow(14),
    maxAttempts: 3,
    status: 'OPEN',
    createdAt: isoHoursAgo(120),
    applicantCount: 2,
  },
];

function makePassport(
  partial: Omit<ConsolePassport, 'grade' | 'organizationId' | 'verifyUrl' | 'competencies' | 'insights'> & {
    competencies?: ConsolePassport['competencies'];
    insights?: ConsolePassport['insights'];
  },
): ConsolePassport {
  const score = partial.score;
  return {
    organizationId: DEMO_ORG_ID,
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
      summary: 'Strong communicator with solid role fit. Probe system-design depth in live round.',
      summaryAr: 'متواصل قوي مع ملاءمة جيدة للدور. اختبر عمق تصميم الأنظمة في الجولة الحية.',
      greenFlags: ['Clear STAR examples', 'Ownership mindset'],
      greenFlagsAr: ['أمثلة STAR واضحة', 'عقلية تحمل المسؤولية'],
      redFlags: score < 60 ? ['Thin technical depth'] : [],
      redFlagsAr: score < 60 ? ['عمق تقني محدود'] : [],
    },
    ...partial,
  };
}

export let DEMO_PASSPORTS: ConsolePassport[] = [
  makePassport({
    id: 'pass-demo-1',
    candidateName: 'Yasmin Al-Harbi',
    candidateEmail: 'yasmin@example.com',
    avatarUrl: null,
    role: 'Software Engineer',
    roleAr: 'مهندس برمجيات',
    score: 86,
    stageKey: 'SHORTLISTED',
    jobId: 'job-demo-swe',
    jobTitle: 'Software Engineer',
    submittedAt: isoHoursAgo(2),
    transcript: [
      {
        q: 'Walk me through a recent project.',
        qAr: 'أخبرني عن مشروع حديث.',
        a: 'I led a payments microservice migration that cut latency 35%.',
        aAr: 'قدت ترحيل خدمة مدفوعات خفّض الكمون بنسبة 35٪.',
      },
      {
        q: 'Hardest problem solved?',
        a: 'Debugged a race condition under peak traffic with zero downtime.',
      },
    ],
    notes: [
      {
        id: 'n1',
        author: 'Omar Faris',
        body: '@Sara strong hire signal — schedule onsite.',
        at: isoHoursAgo(1),
        mention: 'Sara',
      },
    ],
    tags: ['strong-hire', 'riyadh'],
  }),
  makePassport({
    id: 'pass-demo-2',
    candidateName: 'Karim Nasser',
    candidateEmail: 'karim@example.com',
    avatarUrl: null,
    role: 'Software Engineer',
    roleAr: 'مهندس برمجيات',
    score: 72,
    stageKey: 'REVIEWED',
    jobId: 'job-demo-swe',
    jobTitle: 'Software Engineer',
    submittedAt: isoHoursAgo(8),
    transcript: [
      { q: 'Walk me through a recent project.', a: 'Built an internal dashboard for ops.' },
    ],
    notes: [],
    tags: ['follow-up'],
  }),
  makePassport({
    id: 'pass-demo-3',
    candidateName: 'Nour Saleh',
    candidateEmail: 'nour@example.com',
    avatarUrl: null,
    role: 'Product Manager',
    roleAr: 'مدير منتج',
    score: 91,
    stageKey: 'INTERVIEWED',
    jobId: 'job-demo-pm',
    jobTitle: 'Product Manager',
    submittedAt: isoHoursAgo(14),
    transcript: [
      { q: 'Tell me about prioritization.', a: 'I use RICE with stakeholder calibration weekly.' },
    ],
    notes: [],
    tags: ['top-talent'],
  }),
  makePassport({
    id: 'pass-demo-4',
    candidateName: 'Faisal Qureshi',
    candidateEmail: 'faisal@example.com',
    avatarUrl: null,
    role: 'Software Engineer',
    score: 48,
    stageKey: 'NEW',
    jobId: 'job-demo-swe',
    jobTitle: 'Software Engineer',
    submittedAt: isoHoursAgo(20),
    transcript: [{ q: 'Walk me through a recent project.', a: 'I helped with bug fixes.' }],
    notes: [],
    tags: [],
  }),
  makePassport({
    id: 'pass-demo-5',
    candidateName: 'Hana Mansour',
    candidateEmail: 'hana@example.com',
    avatarUrl: null,
    role: 'Product Manager',
    score: 64,
    stageKey: 'NEW',
    jobId: 'job-demo-pm',
    jobTitle: 'Product Manager',
    submittedAt: isoHoursAgo(30),
    transcript: [],
    notes: [],
    tags: [],
  }),
  makePassport({
    id: 'pass-demo-6',
    candidateName: 'Zaid Ibrahim',
    candidateEmail: 'zaid@example.com',
    avatarUrl: null,
    role: 'Software Engineer',
    score: 78,
    stageKey: 'HIRED',
    jobId: 'job-demo-swe',
    jobTitle: 'Software Engineer',
    submittedAt: isoHoursAgo(90),
    transcript: [],
    notes: [],
    tags: ['hired'],
  }),
];

export type ConsoleDemoStore = {
  org: ConsoleOrganization;
  members: ConsoleMember[];
  stages: ConsolePipelineStage[];
  jobs: ConsoleJobPosting[];
  passports: ConsolePassport[];
};

export const demoConsoleStore: ConsoleDemoStore = {
  org: { ...DEMO_ORG, whiteLabel: { ...DEMO_ORG.whiteLabel } },
  members: [...DEMO_MEMBERS],
  stages: [...DEMO_STAGES],
  jobs: [...DEMO_JOBS],
  passports: [...DEMO_PASSPORTS],
};

export function resetConsoleDemo() {
  demoConsoleStore.org = { ...DEMO_ORG, whiteLabel: { ...DEMO_ORG.whiteLabel } };
  demoConsoleStore.members = [...DEMO_MEMBERS];
  demoConsoleStore.stages = [...DEMO_STAGES];
  demoConsoleStore.jobs = DEMO_JOBS.map((j) => ({ ...j, questions: [...j.questions] }));
  demoConsoleStore.passports = DEMO_PASSPORTS.map((p) => ({
    ...p,
    notes: [...p.notes],
    tags: [...p.tags],
  }));
}

export function buildDemoDashboard(): ConsoleDashboard {
  const passports = demoConsoleStore.passports.filter(
    (p) => p.organizationId === DEMO_ORG_ID,
  );
  const completed = passports.length;
  const avg =
    completed === 0
      ? 0
      : Math.round(passports.reduce((s, p) => s + p.score, 0) / completed);
  const pipelineCounts: Record<string, number> = {};
  for (const s of demoConsoleStore.stages) pipelineCounts[s.key] = 0;
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

/** Preview mode: always available for the seeded demo slug. */
export function isDemoSlug(slug: string): boolean {
  return slug === DEMO_ORG_SLUG;
}
