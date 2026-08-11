import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import {
  buildDemoDashboard,
  demoConsoleStore,
  DEMO_ORG_ID,
} from './demo-data';
import {
  DEFAULT_PIPELINE_STAGES,
  defaultQuestionsForRole,
  scoreToGrade,
} from './defaults';
import type {
  ConsoleDashboard,
  ConsoleJobPosting,
  ConsoleMember,
  ConsoleOrganization,
  ConsolePassport,
  ConsolePipelineStage,
  InterviewQuestion,
  JobBranding,
  OrgMemberRole,
  WhiteLabelConfig,
} from './types';
import type { ConsoleContext } from './auth';

function interviewSlug() {
  return randomBytes(6).toString('hex');
}

export async function getDashboard(ctx: ConsoleContext): Promise<ConsoleDashboard> {
  if (ctx.usingDemo) return buildDemoDashboard();

  const tenantId = ctx.organizationId;
  const [jobs, stages] = await Promise.all([
    db.jobPosting.findMany({
      where: { organizationId: tenantId },
      select: { id: true, title: true },
    }),
    db.pipelineStage.findMany({
      where: { organizationId: tenantId },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  // Phase 1 live path: prefer demo-shaped empty feed until submissions wire to JobPosting
  const pipelineCounts: Record<string, number> = {};
  for (const s of stages) pipelineCounts[s.key] = 0;

  return {
    kpis: {
      passportsReceived: 0,
      avgScore: 0,
      interviewsCompleted: 0,
      timeSavedHours: 0,
    },
    feed: [],
    pipelineCounts,
  };
}

export async function listPassports(
  ctx: ConsoleContext,
): Promise<ConsolePassport[]> {
  if (ctx.usingDemo) {
    return demoConsoleStore.passports.filter(
      (p) => p.organizationId === ctx.organizationId,
    );
  }
  return [];
}

export async function getPassport(
  ctx: ConsoleContext,
  id: string,
): Promise<ConsolePassport | null> {
  if (ctx.usingDemo) {
    return (
      demoConsoleStore.passports.find(
        (p) => p.id === id && p.organizationId === ctx.organizationId,
      ) || null
    );
  }
  return null;
}

export async function movePassportStage(
  ctx: ConsoleContext,
  passportId: string,
  stageKey: string,
): Promise<ConsolePassport | null> {
  if (ctx.usingDemo) {
    const p = demoConsoleStore.passports.find(
      (x) => x.id === passportId && x.organizationId === ctx.organizationId,
    );
    if (!p) return null;
    const ok = demoConsoleStore.stages.some(
      (s) => s.organizationId === ctx.organizationId && s.key === stageKey,
    );
    if (!ok) return null;
    p.stageKey = stageKey;
    return p;
  }
  return null;
}

export async function addPassportNote(
  ctx: ConsoleContext,
  passportId: string,
  body: string,
  author: string,
): Promise<ConsolePassport | null> {
  if (ctx.usingDemo) {
    const p = demoConsoleStore.passports.find(
      (x) => x.id === passportId && x.organizationId === ctx.organizationId,
    );
    if (!p) return null;
    const mention = body.match(/@(\w+)/)?.[1];
    p.notes.unshift({
      id: `n-${Date.now()}`,
      author,
      body,
      at: new Date().toISOString(),
      mention,
    });
    return p;
  }
  return null;
}

export async function listJobs(ctx: ConsoleContext): Promise<ConsoleJobPosting[]> {
  if (ctx.usingDemo) {
    return demoConsoleStore.jobs.filter((j) => j.organizationId === ctx.organizationId);
  }
  const rows = await db.jobPosting.findMany({
    where: { organizationId: ctx.organizationId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({
    id: r.id,
    organizationId: r.organizationId,
    title: r.title,
    titleAr: r.titleAr,
    roleKey: r.roleKey,
    difficulty: r.difficulty,
    language: r.language,
    questions: (r.questions as InterviewQuestion[]) || [],
    branding: (r.branding as JobBranding) || null,
    interviewSlug: r.interviewSlug,
    expiresAt: r.expiresAt?.toISOString() || null,
    maxAttempts: r.maxAttempts,
    status: r.status as ConsoleJobPosting['status'],
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createJob(
  ctx: ConsoleContext,
  input: {
    title: string;
    titleAr?: string;
    roleKey?: string;
    difficulty?: string;
    language?: string;
    questions?: InterviewQuestion[];
    branding?: JobBranding | null;
    expiresAt?: string | null;
    maxAttempts?: number;
    status?: ConsoleJobPosting['status'];
  },
): Promise<ConsoleJobPosting> {
  const questions =
    input.questions?.length
      ? input.questions
      : defaultQuestionsForRole(input.roleKey || 'software_engineer');

  if (ctx.usingDemo) {
    const job: ConsoleJobPosting = {
      id: `job-${Date.now()}`,
      organizationId: ctx.organizationId,
      title: input.title,
      titleAr: input.titleAr || null,
      roleKey: input.roleKey || null,
      difficulty: input.difficulty || 'MID',
      language: input.language || 'MIXED',
      questions,
      branding: input.branding || null,
      interviewSlug: interviewSlug(),
      expiresAt: input.expiresAt || null,
      maxAttempts: input.maxAttempts ?? 3,
      status: input.status || 'OPEN',
      createdAt: new Date().toISOString(),
      applicantCount: 0,
    };
    demoConsoleStore.jobs.unshift(job);
    return job;
  }

  const row = await db.jobPosting.create({
    data: {
      organizationId: ctx.organizationId,
      title: input.title,
      titleAr: input.titleAr,
      roleKey: input.roleKey,
      difficulty: input.difficulty || 'MID',
      language: input.language || 'MIXED',
      questions: questions as unknown as Prisma.InputJsonValue,
      branding: (input.branding || undefined) as Prisma.InputJsonValue | undefined,
      interviewSlug: interviewSlug(),
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      maxAttempts: input.maxAttempts ?? 3,
      status: input.status || 'OPEN',
      createdById: ctx.userId,
    },
  });

  return {
    id: row.id,
    organizationId: row.organizationId,
    title: row.title,
    titleAr: row.titleAr,
    roleKey: row.roleKey,
    difficulty: row.difficulty,
    language: row.language,
    questions,
    branding: (row.branding as JobBranding) || null,
    interviewSlug: row.interviewSlug,
    expiresAt: row.expiresAt?.toISOString() || null,
    maxAttempts: row.maxAttempts,
    status: row.status as ConsoleJobPosting['status'],
    createdAt: row.createdAt.toISOString(),
    applicantCount: 0,
  };
}

export async function updateJob(
  ctx: ConsoleContext,
  jobId: string,
  patch: Partial<ConsoleJobPosting>,
): Promise<ConsoleJobPosting | null> {
  if (ctx.usingDemo) {
    const j = demoConsoleStore.jobs.find(
      (x) => x.id === jobId && x.organizationId === ctx.organizationId,
    );
    if (!j) return null;
    Object.assign(j, patch, { organizationId: ctx.organizationId, id: j.id });
    return j;
  }

  const existing = await db.jobPosting.findFirst({
    where: { id: jobId, organizationId: ctx.organizationId },
  });
  if (!existing) return null;

  const row = await db.jobPosting.update({
    where: { id: jobId },
    data: {
      title: patch.title,
      titleAr: patch.titleAr,
      roleKey: patch.roleKey,
      difficulty: patch.difficulty,
      language: patch.language,
      questions:
        patch.questions === undefined
          ? undefined
          : (patch.questions as unknown as Prisma.InputJsonValue),
      branding:
        patch.branding === undefined
          ? undefined
          : patch.branding === null
            ? Prisma.JsonNull
            : (patch.branding as unknown as Prisma.InputJsonValue),
      expiresAt:
        patch.expiresAt === undefined
          ? undefined
          : patch.expiresAt
            ? new Date(patch.expiresAt)
            : null,
      maxAttempts: patch.maxAttempts,
      status: patch.status,
    },
  });

  return {
    id: row.id,
    organizationId: row.organizationId,
    title: row.title,
    titleAr: row.titleAr,
    roleKey: row.roleKey,
    difficulty: row.difficulty,
    language: row.language,
    questions: (row.questions as InterviewQuestion[]) || [],
    branding: (row.branding as JobBranding) || null,
    interviewSlug: row.interviewSlug,
    expiresAt: row.expiresAt?.toISOString() || null,
    maxAttempts: row.maxAttempts,
    status: row.status as ConsoleJobPosting['status'],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listStages(
  ctx: ConsoleContext,
): Promise<ConsolePipelineStage[]> {
  if (ctx.usingDemo) {
    return demoConsoleStore.stages
      .filter((s) => s.organizationId === ctx.organizationId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const rows = await db.pipelineStage.findMany({
    where: { organizationId: ctx.organizationId },
    orderBy: { sortOrder: 'asc' },
  });
  return rows.map((r) => ({
    id: r.id,
    organizationId: r.organizationId,
    key: r.key,
    labelEn: r.labelEn,
    labelAr: r.labelAr,
    sortOrder: r.sortOrder,
    isTerminal: r.isTerminal,
    color: r.color,
  }));
}

export async function ensureDefaultStages(organizationId: string) {
  const count = await db.pipelineStage.count({ where: { organizationId } });
  if (count > 0) return;
  await db.pipelineStage.createMany({
    data: DEFAULT_PIPELINE_STAGES.map((s) => ({
      organizationId,
      key: s.key,
      labelEn: s.labelEn,
      labelAr: s.labelAr,
      sortOrder: s.sortOrder,
      isTerminal: s.isTerminal,
      color: s.color,
    })),
  });
}

export async function listMembers(ctx: ConsoleContext): Promise<ConsoleMember[]> {
  if (ctx.usingDemo) {
    return demoConsoleStore.members.filter(
      (m) => m.organizationId === ctx.organizationId,
    );
  }
  const rows = await db.organizationMember.findMany({
    where: { organizationId: ctx.organizationId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((r) => ({
    id: r.id,
    organizationId: r.organizationId,
    userId: r.userId,
    role: r.role as OrgMemberRole,
    invitedEmail: r.invitedEmail,
    invitedName: r.invitedName,
    status: r.status,
    name: r.user?.name || r.invitedName,
    email: r.user?.email || r.invitedEmail,
    lastActiveAt: r.lastActiveAt?.toISOString() || null,
  }));
}

export async function inviteMember(
  ctx: ConsoleContext,
  input: { email: string; name?: string; role: OrgMemberRole },
): Promise<ConsoleMember> {
  if (ctx.usingDemo) {
    const m: ConsoleMember = {
      id: `mem-${Date.now()}`,
      organizationId: ctx.organizationId,
      userId: null,
      role: input.role,
      invitedEmail: input.email,
      invitedName: input.name || null,
      status: 'INVITED',
      name: input.name,
      email: input.email,
      lastActiveAt: null,
    };
    demoConsoleStore.members.push(m);
    return m;
  }

  const row = await db.organizationMember.create({
    data: {
      organizationId: ctx.organizationId,
      role: input.role,
      invitedEmail: input.email,
      invitedName: input.name,
      status: 'INVITED',
    },
  });
  return {
    id: row.id,
    organizationId: row.organizationId,
    userId: row.userId,
    role: row.role as OrgMemberRole,
    invitedEmail: row.invitedEmail,
    invitedName: row.invitedName,
    status: row.status,
    name: row.invitedName,
    email: row.invitedEmail,
  };
}

export async function updateSettings(
  ctx: ConsoleContext,
  patch: {
    name?: string;
    industry?: string;
    size?: string;
    country?: string;
    whiteLabel?: WhiteLabelConfig;
  },
) {
  if (ctx.usingDemo) {
    if (patch.name) demoConsoleStore.org.name = patch.name;
    if (patch.industry !== undefined) demoConsoleStore.org.industry = patch.industry;
    if (patch.size !== undefined) demoConsoleStore.org.size = patch.size;
    if (patch.country !== undefined) demoConsoleStore.org.country = patch.country;
    if (patch.whiteLabel) {
      demoConsoleStore.org.whiteLabel = {
        ...(demoConsoleStore.org.whiteLabel || {}),
        ...patch.whiteLabel,
      };
    }
    return demoConsoleStore.org;
  }

  const row = await db.organization.update({
    where: { id: ctx.organizationId },
    data: {
      name: patch.name,
      industry: patch.industry,
      size: patch.size,
      country: patch.country,
      whiteLabel:
        patch.whiteLabel === undefined
          ? undefined
          : (patch.whiteLabel as unknown as Prisma.InputJsonValue),
    },
  });
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tenantType: row.tenantType as ConsoleOrganization['tenantType'],
    plan: row.plan as ConsoleOrganization['plan'],
    industry: row.industry,
    size: row.size,
    country: row.country,
    companyId: row.companyId,
    whiteLabel: row.whiteLabel as WhiteLabelConfig,
    status: row.status,
  };
}

export async function getAnalytics(ctx: ConsoleContext) {
  const dash = await getDashboard(ctx);
  const passports = await listPassports(ctx);
  const jobs = await listJobs(ctx);

  const histogram = Array.from({ length: 10 }, (_, i) => ({
    bucket: `${i * 10}-${i * 10 + 9}`,
    count: passports.filter((p) => p.score >= i * 10 && p.score < i * 10 + 10).length,
  }));
  histogram[9].count += passports.filter((p) => p.score === 100).length;

  const funnel = {
    applied: passports.length,
    started: passports.length,
    completed: passports.length,
    passed: passports.filter((p) => p.score >= 70).length,
    hired: passports.filter((p) => p.stageKey === 'HIRED').length,
  };

  const rolePerf = jobs.map((j) => {
    const rows = passports.filter((p) => p.jobId === j.id);
    const avg =
      rows.length === 0
        ? 0
        : Math.round(rows.reduce((s, p) => s + p.score, 0) / rows.length);
    return {
      jobId: j.id,
      title: j.title,
      titleAr: j.titleAr,
      candidates: rows.length,
      avgScore: avg,
      dropOff: Math.max(0, (j.applicantCount || rows.length) - rows.length),
    };
  });

  const hours = dash.kpis.timeSavedHours;
  const laborRate = 50;
  const planCost =
    ctx.organization.plan === 'ENTERPRISE'
      ? 999
      : ctx.organization.plan === 'PRO'
        ? 499
        : 199;
  const savedUsd = hours * laborRate;

  return {
    funnel,
    histogram,
    rolePerf,
    timeToHireDays: 6.5,
    roi: {
      hoursSaved: hours,
      laborSavedUsd: savedUsd,
      subscriptionUsd: planCost,
      netSavingsUsd: savedUsd - planCost,
    },
    passports,
  };
}

export function demoOrgId() {
  return DEMO_ORG_ID;
}
