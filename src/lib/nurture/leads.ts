import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import {
  localeFromPreferred,
  type NurtureSequence,
} from './constants';
import { parseStringList, parseTags } from './validate';
import {
  addDaysAtNine,
  cityTimezone,
  hoursFromNow,
  nextMondayAtNine,
} from './schedule';
import { countActiveRoles, matchingRoles } from './jobs';
import {
  NURTURE_REPLY_TO,
  NURTURE_SENDER,
  renderNurtureEmail,
  type NurtureMerge,
} from './templates';
import { sendBrevoEmail } from '@/lib/brevo';

export function newPrefToken(): string {
  return randomBytes(24).toString('base64url');
}

export type GateScoreSnapshot = {
  overallScore?: number;
  strengths?: string[];
  improvements?: string[];
  competencies?: Record<string, number>;
};

export type UpsertLeadInput = {
  email: string;
  fullName: string;
  currentCity?: string | null;
  company?: string | null;
  phone?: string | null;
  yearsExperience?: string | null;
  preferredLanguage?: string | null;
  source: 'GATE1' | 'GATE2' | 'SIGNUP' | 'SAVE_ROLE';
  userId?: string | null;
  role?: string | null;
  jobCompany?: string | null;
  jobId?: string | null;
  tags?: string[];
  score?: GateScoreSnapshot;
  incrementPractice?: boolean;
};

function mergeTags(existing: string, extra: string[]): string {
  const set = new Set([...parseTags(existing), ...extra]);
  return JSON.stringify([...set]);
}

export async function upsertNurtureLead(input: UpsertLeadInput) {
  const timezone = cityTimezone(input.currentCity);
  const existing = await db.nurtureLead.findUnique({
    where: { email: input.email },
    include: { preference: true },
  });

  const nextScore = input.score?.overallScore;
  const prevScore = existing?.lastOverallScore ?? null;
  const delta =
    nextScore != null && prevScore != null ? nextScore - prevScore : existing?.lastScoreDelta ?? null;

  const data = {
    fullName: input.fullName,
    currentCity: input.currentCity ?? existing?.currentCity,
    company: input.company ?? existing?.company,
    phone: input.phone ?? existing?.phone,
    yearsExperience: input.yearsExperience ?? existing?.yearsExperience,
    preferredLanguage:
      input.preferredLanguage ?? existing?.preferredLanguage ?? 'EN',
    timezone,
    userId: input.userId ?? existing?.userId,
    lastRole: input.role ?? existing?.lastRole,
    lastCompany: input.jobCompany ?? existing?.lastCompany,
    lastJobId: input.jobId ?? existing?.lastJobId,
    lastOverallScore: nextScore ?? existing?.lastOverallScore,
    lastScoreDelta: delta,
    lastStrengths: input.score?.strengths
      ? JSON.stringify(input.score.strengths.slice(0, 3))
      : existing?.lastStrengths ?? '[]',
    lastImprovements: input.score?.improvements
      ? JSON.stringify(input.score.improvements.slice(0, 3))
      : existing?.lastImprovements ?? '[]',
    lastCompetencies: input.score?.competencies
      ? JSON.stringify(input.score.competencies)
      : existing?.lastCompetencies ?? '{}',
    tags: mergeTags(existing?.tags || '[]', input.tags || []),
  };

  const lead = existing
    ? await db.nurtureLead.update({
        where: { id: existing.id },
        data: {
          ...data,
          practiceCount: input.incrementPractice
            ? { increment: 1 }
            : undefined,
          lastPracticedAt: input.incrementPractice ? new Date() : undefined,
        },
        include: { preference: true },
      })
    : await db.nurtureLead.create({
        data: {
          email: input.email,
          source: input.source,
          practiceCount: input.incrementPractice ? 1 : 0,
          lastPracticedAt: input.incrementPractice ? new Date() : undefined,
          ...data,
        },
        include: { preference: true },
      });

  if (!lead.preference) {
    await db.nurturePreference.create({
      data: { leadId: lead.id, token: newPrefToken() },
    });
  }

  return db.nurtureLead.findUniqueOrThrow({
    where: { id: lead.id },
    include: { preference: true },
  });
}

export async function enrollSequence(
  leadId: string,
  sequence: NurtureSequence,
  opts?: { nextSendAt?: Date; step?: number; metadata?: Record<string, unknown> },
) {
  const existing = await db.nurtureEnrollment.findUnique({
    where: { leadId_sequence: { leadId, sequence } },
  });
  const metadata = JSON.stringify(opts?.metadata || {});
  if (existing) {
    if (existing.status === 'ACTIVE') {
      if (opts?.metadata) {
        await db.nurtureEnrollment.update({
          where: { id: existing.id },
          data: { metadata },
        });
      }
      return existing;
    }
    return db.nurtureEnrollment.update({
      where: { id: existing.id },
      data: {
        status: 'ACTIVE',
        step: opts?.step ?? 1,
        nextSendAt: opts?.nextSendAt ?? new Date(),
        metadata,
      },
    });
  }
  return db.nurtureEnrollment.create({
    data: {
      leadId,
      sequence,
      step: opts?.step ?? 1,
      status: 'ACTIVE',
      nextSendAt: opts?.nextSendAt ?? new Date(),
      metadata,
    },
  });
}

export async function pauseSequence(leadId: string, sequence: NurtureSequence) {
  await db.nurtureEnrollment.updateMany({
    where: { leadId, sequence, status: 'ACTIVE' },
    data: { status: 'PAUSED' },
  });
}

export async function recordNurtureEvent(opts: {
  leadId?: string | null;
  email?: string | null;
  kind: string;
  path?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await db.nurtureEvent.create({
    data: {
      leadId: opts.leadId || null,
      email: opts.email || null,
      kind: opts.kind,
      path: opts.path || null,
      metadata: JSON.stringify(opts.metadata || {}),
    },
  });
}

export async function buildMergeForLead(
  lead: {
    fullName: string;
    email: string;
    currentCity: string | null;
    lastRole: string | null;
    lastCompany: string | null;
    lastJobId: string | null;
    lastOverallScore: number | null;
    lastScoreDelta: number | null;
    lastStrengths: string;
    lastImprovements: string;
    lastCompetencies: string;
    preferredLanguage: string;
    lastApplyClickAt: Date | null;
  },
  token: string,
  enrollmentId: string,
): Promise<NurtureMerge> {
  const strengths = parseStringList(lead.lastStrengths);
  const improvements = parseStringList(lead.lastImprovements);
  let competencies: Record<string, number> = {};
  try {
    competencies = JSON.parse(lead.lastCompetencies || '{}') as Record<string, number>;
  } catch {
    competencies = {};
  }
  const [jobs, jobCount] = await Promise.all([
    matchingRoles({ city: lead.currentCity, role: lead.lastRole }),
    countActiveRoles(),
  ]);
  const score2 = lead.lastOverallScore;
  const score1 =
    score2 != null && lead.lastScoreDelta != null
      ? score2 - lead.lastScoreDelta
      : null;
  return {
    name: lead.fullName,
    email: lead.email,
    city: lead.currentCity,
    role: lead.lastRole,
    company: lead.lastCompany,
    score: lead.lastOverallScore,
    score1,
    score2,
    strengths,
    improvements,
    competencies,
    preferredLanguage: lead.preferredLanguage,
    token,
    enrollmentId,
    jobs,
    jobCount,
    applyDate: lead.lastApplyClickAt
      ? lead.lastApplyClickAt.toISOString().slice(0, 10)
      : null,
    lastJobId: lead.lastJobId,
  };
}

export async function sendNurtureNow(opts: {
  sequence: string;
  step: number;
  lead: Parameters<typeof buildMergeForLead>[0] & { id: string };
  token: string;
  enrollmentId: string;
}): Promise<{ success: boolean; error?: string }> {
  const merge = await buildMergeForLead(opts.lead, opts.token, opts.enrollmentId);
  const rendered = renderNurtureEmail({
    sequence: opts.sequence,
    step: opts.step,
    merge,
  });
  if (!rendered) return { success: false, error: 'no_template' };
  return sendBrevoEmail({
    to: opts.lead.email,
    subject: rendered.subject,
    html: rendered.html,
    sender: NURTURE_SENDER,
    replyTo: NURTURE_REPLY_TO,
  });
}

export async function afterGate1(leadId: string, timezone: string) {
  const now = new Date();
  const enrollment = await enrollSequence(leadId, 'NEW_SIGNUP', {
    step: 2,
    nextSendAt: addDaysAtNine(now, 2, timezone),
  });
  return enrollment;
}

export async function afterGate2(leadId: string, timezone: string) {
  await afterGate1(leadId, timezone);
}

export async function afterPracticeComplete(lead: {
  id: string;
  practiceCount: number;
  timezone: string;
}) {
  if (lead.practiceCount >= 2) {
    await pauseSequence(lead.id, 'NEW_SIGNUP');
    await enrollSequence(lead.id, 'ACTIVE_PRACTICERS', {
      step: 1,
      nextSendAt: hoursFromNow(24),
    });
  }
}

export async function afterJobsBrowse(leadId: string, timezone: string) {
  await db.nurtureLead.update({
    where: { id: leadId },
    data: { lastJobsBrowseAt: new Date() },
  });
  await enrollSequence(leadId, 'JOB_SEEKERS', {
    step: 1,
    nextSendAt: nextMondayAtNine(new Date(), timezone),
  });
}

export async function afterJobClick(
  leadId: string,
  timezone: string,
  meta: { role?: string; company?: string; jobId?: string },
) {
  await db.nurtureLead.update({
    where: { id: leadId },
    data: {
      lastJobClickAt: new Date(),
      lastRole: meta.role,
      lastCompany: meta.company,
      lastJobId: meta.jobId,
    },
  });
  await enrollSequence(leadId, 'JOB_CLICK', {
    step: 1,
    nextSendAt: addDaysAtNine(new Date(), 1, timezone),
    metadata: meta,
  });
}

export async function afterApplyClick(
  leadId: string,
  timezone: string,
  meta: { role?: string; company?: string; jobId?: string },
) {
  await db.nurtureLead.update({
    where: { id: leadId },
    data: {
      lastApplyClickAt: new Date(),
      lastRole: meta.role,
      lastCompany: meta.company,
      lastJobId: meta.jobId,
    },
  });
  await enrollSequence(leadId, 'APPLY_FOLLOWUP', {
    step: 1,
    nextSendAt: addDaysAtNine(new Date(), 3, timezone),
    metadata: meta,
  });
}

export function leadLocale(preferred?: string | null): 'en' | 'ar' {
  return localeFromPreferred(preferred);
}
