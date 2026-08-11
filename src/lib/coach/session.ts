import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { debitPractice } from '@/lib/plans/entitlements';
import { getInterviewConfig } from './config';
import { getCoachAccess } from './access';
import { resolveCoachName } from './prompts';
import type { ChatMessage, PrepSelections } from './types';
import { trackCoachEvent } from './analytics';

export const COACH_ENGINE = 'jeannie-coach';

export type CoachSessionSnapshot = {
  sessionId: string;
  prequalId: string;
  prep: PrepSelections;
  history: ChatMessage[];
  status: string;
  startedAt: string | null;
};

type FullReportShape = {
  engine?: string;
  prep?: PrepSelections;
  coachName?: string;
  history?: ChatMessage[];
  integrity?: {
    tabBlurCount?: number;
    recordingArchive?: string | null;
    notes?: string[];
  };
  [key: string]: unknown;
};

function isCoachReport(value: unknown): value is FullReportShape {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as FullReportShape).engine === COACH_ENGINE
  );
}

function asPrep(value: unknown, fallback?: PrepSelections): PrepSelections | null {
  if (fallback) return fallback;
  if (!value || typeof value !== 'object') return null;
  const p = value as PrepSelections;
  if (!p.role || !p.industry || !p.seniority) return null;
  return p;
}

export async function findActiveCoachSession(
  userId: string,
): Promise<CoachSessionSnapshot | null> {
  try {
    const rows = await db.interviewSession.findMany({
      where: {
        userId,
        status: { in: ['active', 'pending'] },
      },
      include: { prequal: true },
      orderBy: { updatedAt: 'desc' },
      take: 8,
    });

    for (const row of rows) {
      const report = isCoachReport(row.fullReport)
        ? row.fullReport
        : isCoachReport(row.prequal.generatedPlan)
          ? (row.prequal.generatedPlan as FullReportShape)
          : null;
      if (!report) continue;
      const prep = asPrep(report.prep);
      if (!prep) continue;
      return {
        sessionId: row.id,
        prequalId: row.prequalId,
        prep,
        history: Array.isArray(report.history) ? report.history : [],
        status: row.status,
        startedAt: row.startedAt?.toISOString() ?? null,
      };
    }
    return null;
  } catch (err) {
    console.error('[coach/session] findActive failed', err);
    return null;
  }
}

export async function getCoachSessionForUser(
  userId: string,
  sessionId: string,
): Promise<
  | {
      ok: true;
      session: {
        id: string;
        status: string;
        practiceDebited: boolean;
        startedAt: Date | null;
        prequalId: string;
        fullReport: FullReportShape;
        prep: PrepSelections;
        history: ChatMessage[];
      };
    }
  | { ok: false; error: string; status: number }
> {
  try {
    const row = await db.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { prequal: true },
    });
    if (!row) return { ok: false, error: 'Session not found', status: 404 };

    const report = isCoachReport(row.fullReport)
      ? row.fullReport
      : isCoachReport(row.prequal.generatedPlan)
        ? (row.prequal.generatedPlan as FullReportShape)
        : null;
    if (!report) {
      return { ok: false, error: 'Not a coach session', status: 400 };
    }
    const prep = asPrep(report.prep);
    if (!prep) return { ok: false, error: 'Invalid session prep', status: 400 };

    return {
      ok: true,
      session: {
        id: row.id,
        status: row.status,
        practiceDebited: row.practiceDebited,
        startedAt: row.startedAt,
        prequalId: row.prequalId,
        fullReport: report,
        prep,
        history: Array.isArray(report.history) ? report.history : [],
      },
    };
  } catch (err) {
    console.error('[coach/session] get failed', err);
    return { ok: false, error: 'Session lookup failed', status: 500 };
  }
}

async function abandonActiveCoachSessions(userId: string): Promise<void> {
  try {
    const active = await findActiveCoachSession(userId);
    // Loop in case multiple slipped through historically.
    let guard = 0;
    let current = active;
    while (current && guard < 5) {
      await db.interviewSession.update({
        where: { id: current.sessionId },
        data: {
          status: 'abandoned',
          completedAt: new Date(),
          fullReport: {
            engine: COACH_ENGINE,
            prep: current.prep,
            history: current.history,
            abandoned: true,
          },
        },
      });
      guard += 1;
      current = await findActiveCoachSession(userId);
    }
  } catch (err) {
    console.error('[coach/session] abandon failed', err);
  }
}

/**
 * Start a durable coach session (or resume the existing active one).
 * Hard-enforces getCoachAccess for new sessions.
 */
export async function startCoachSession(opts: {
  userId: string;
  userEmail: string;
  prep: PrepSelections;
  resumeIfActive?: boolean;
}): Promise<
  | { ok: true; session: CoachSessionSnapshot; resumed: boolean }
  | { ok: false; error: string; status: number; upgradeRequired?: boolean }
> {
  const resumeIfActive = opts.resumeIfActive !== false;
  if (resumeIfActive) {
    const existing = await findActiveCoachSession(opts.userId);
    if (existing) {
      await trackCoachEvent(opts.userId, 'coach.session_resume', {
        sessionId: existing.sessionId,
      });
      return { ok: true, session: existing, resumed: true };
    }
  } else {
    await abandonActiveCoachSessions(opts.userId);
  }

  const access = await getCoachAccess(opts.userId);
  if (!access.canStart) {
    return {
      ok: false,
      error: access.reason || 'Interview quota reached. Upgrade to continue.',
      status: 402,
      upgradeRequired: true,
    };
  }

  const cfg = getInterviewConfig();
  const coachName = resolveCoachName(opts.prep.coachGender);
  const clientSessionId = randomUUID();

  try {
    const prequal = await db.interviewPrequal.create({
      data: {
        userId: opts.userId,
        sessionId: clientSessionId,
        userEmail: opts.userEmail,
        targetRole: opts.prep.role,
        seniorityLevel: opts.prep.seniority,
        questionTypes: ['behavioral'],
        interviewRound: 'screening',
        languagePreference: opts.prep.language,
        targetIndustry: opts.prep.industry,
        weaknessFocus: opts.prep.companyName || null,
        durationPreset: 'standard',
        numQuestions: cfg.engine.maxQuestions,
        estimatedDurationMin: 20,
        generatedPlan: {
          engine: COACH_ENGINE,
          prep: opts.prep,
          coachName,
          history: [],
        },
      },
    });

    const session = await db.interviewSession.create({
      data: {
        userId: opts.userId,
        prequalId: prequal.id,
        status: 'active',
        language: opts.prep.language,
        numQuestionsTotal: cfg.engine.maxQuestions,
        numQuestionsAnswered: 0,
        practiceDebited: false,
        startedAt: new Date(),
        fullReport: {
          engine: COACH_ENGINE,
          prep: opts.prep,
          coachName,
          history: [],
          integrity: {
            tabBlurCount: 0,
            recordingArchive: null,
            notes: [],
          },
        },
      },
    });

    // Debit practice at start when possible (bank-path parity). Soft-fail.
    try {
      const debit = await debitPractice(opts.userId);
      if (debit.ok && debit.debited) {
        await db.interviewSession.update({
          where: { id: session.id },
          data: { practiceDebited: true },
        });
      }
    } catch (err) {
      console.error('[coach/session] debit on start failed', err);
    }

    await trackCoachEvent(opts.userId, 'coach.session_start', {
      sessionId: session.id,
      role: opts.prep.role,
      industry: opts.prep.industry,
    });

    return {
      ok: true,
      resumed: false,
      session: {
        sessionId: session.id,
        prequalId: prequal.id,
        prep: opts.prep,
        history: [],
        status: 'active',
        startedAt: session.startedAt?.toISOString() ?? new Date().toISOString(),
      },
    };
  } catch (err) {
    console.error('[coach/session] start failed', err);
    return { ok: false, error: 'Could not start interview session', status: 500 };
  }
}

export async function persistCoachHistory(opts: {
  userId: string;
  sessionId: string;
  history: ChatMessage[];
  prep?: PrepSelections;
}): Promise<boolean> {
  try {
    const loaded = await getCoachSessionForUser(opts.userId, opts.sessionId);
    if (!loaded.ok) return false;
    if (loaded.session.status === 'completed') return false;

    const prep = opts.prep || loaded.session.prep;
    const coachName =
      (typeof loaded.session.fullReport.coachName === 'string'
        ? loaded.session.fullReport.coachName
        : null) || resolveCoachName(prep.coachGender);

    const nextReport: FullReportShape = {
      ...loaded.session.fullReport,
      engine: COACH_ENGINE,
      prep,
      coachName,
      history: opts.history,
      integrity: loaded.session.fullReport.integrity || {
        tabBlurCount: 0,
        recordingArchive: null,
        notes: [],
      },
    };

    await db.interviewSession.update({
      where: { id: opts.sessionId },
      data: {
        status: 'active',
        numQuestionsAnswered: opts.history.filter((m) => m.role === 'user').length,
        fullReport: nextReport as object,
        updatedAt: new Date(),
      },
    });

    await db.interviewPrequal.update({
      where: { id: loaded.session.prequalId },
      data: {
        generatedPlan: {
          engine: COACH_ENGINE,
          prep,
          coachName,
          history: opts.history,
        } as object,
      },
    });

    return true;
  } catch (err) {
    console.error('[coach/session] persist failed', err);
    return false;
  }
}

/** Soft integrity signal — tab blur / focus loss during AI interview. */
export async function recordCoachIntegritySignal(opts: {
  userId: string;
  sessionId: string;
  signal: 'tab_blur' | 'visibility_hidden';
}): Promise<void> {
  try {
    const loaded = await getCoachSessionForUser(opts.userId, opts.sessionId);
    if (!loaded.ok || loaded.session.status === 'completed') return;
    const integrity = {
      tabBlurCount: 0,
      recordingArchive: null as string | null,
      notes: [] as string[],
      ...(loaded.session.fullReport.integrity || {}),
    };
    integrity.tabBlurCount = (integrity.tabBlurCount || 0) + 1;
    integrity.notes = [
      ...(integrity.notes || []).slice(-19),
      `${new Date().toISOString()}:${opts.signal}`,
    ];
    await db.interviewSession.update({
      where: { id: opts.sessionId },
      data: {
        fullReport: {
          ...loaded.session.fullReport,
          integrity,
        } as object,
      },
    });
  } catch (err) {
    console.error('[coach/session] integrity signal failed', err);
  }
}
