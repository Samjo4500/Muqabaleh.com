import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { generateVerificationId } from '@/lib/ai';
import { debitPractice } from '@/lib/plans/entitlements';
import { getInterviewConfig } from './config';
import { getCoachAccess } from './access';
import { scoreTranscript } from './gemini';
import { resolveCoachName } from './prompts';
import { buildPassportPdfBuffer } from './passport-pdf';
import { sendPassportViaBrevo } from './brevo-passport';
import { trackCoachEvent } from './analytics';
import {
  COACH_ENGINE,
  getCoachSessionForUser,
  startCoachSession,
} from './session';
import type { ChatMessage, CoachScoreResult, PrepSelections } from './types';

export type CompleteResult = {
  ok: boolean;
  interviewId?: string;
  verificationId?: string;
  sessionId?: string;
  score?: CoachScoreResult;
  gateLabel?: string;
  passportPdfUnlocked?: boolean;
  emailed?: boolean;
  error?: string;
  upgradeRequired?: boolean;
};

function mapLanguage(lang: PrepSelections['language']): string {
  if (lang === 'en') return 'EN';
  if (lang === 'mixed') return 'AR';
  return 'AR';
}

function mapExperience(seniority: string): string {
  switch (seniority) {
    case 'entry':
      return 'JUNIOR';
    case 'mid':
      return 'MID';
    case 'senior':
      return 'SENIOR';
    case 'manager':
    case 'executive':
      return 'EXECUTIVE';
    default:
      return 'MID';
  }
}

function transcriptFrom(history: ChatMessage[]): string {
  return history
    .map((m) => `${m.role === 'assistant' ? 'Coach' : 'Candidate'}: ${m.content}`)
    .join('\n\n');
}

/**
 * Score transcript, finalize an active durable session (or create one under quota),
 * optionally email PDF. Never throws — returns safe fallback on DB errors.
 */
export async function completeCoachInterview(opts: {
  userId: string;
  userEmail: string;
  candidateName: string;
  prep: PrepSelections;
  history: ChatMessage[];
  sessionId?: string;
}): Promise<CompleteResult> {
  const cfg = getInterviewConfig();
  const access = await getCoachAccess(opts.userId);

  let sessionId = opts.sessionId || access.activeSessionId || null;

  if (sessionId) {
    const loaded = await getCoachSessionForUser(opts.userId, sessionId);
    if (!loaded.ok) {
      return {
        ok: false,
        error: loaded.error,
        upgradeRequired: loaded.status === 402,
      };
    }
    if (loaded.session.status === 'completed') {
      const prior = loaded.session.fullReport.score as CoachScoreResult | undefined;
      return {
        ok: true,
        sessionId,
        score: prior,
        gateLabel: access.gateLabel,
        passportPdfUnlocked:
          access.gate.passportPdf && prior?.scoringMode === 'model',
        emailed: false,
        upgradeRequired: !access.gate.passportPdf || prior?.scoringMode !== 'model',
      };
    }
  } else {
    // No durable session yet — only allow create+complete if quota remains.
    if (!access.canStart) {
      await trackCoachEvent(opts.userId, 'coach.complete_blocked', {
        reason: access.reason,
      });
      return {
        ok: false,
        error: access.reason || 'Interview quota reached. Upgrade to continue.',
        upgradeRequired: true,
      };
    }
    const started = await startCoachSession({
      userId: opts.userId,
      userEmail: opts.userEmail,
      prep: opts.prep,
      resumeIfActive: false,
    });
    if (!started.ok) {
      return {
        ok: false,
        error: started.error,
        upgradeRequired: started.upgradeRequired,
      };
    }
    sessionId = started.session.sessionId;
  }

  const score = await scoreTranscript(opts.prep, transcriptFrom(opts.history));
  const coachName = resolveCoachName(opts.prep.coachGender);
  // Passport PDF only for model scores on paid passport tiers.
  const passportPdfUnlocked =
    access.gate.passportPdf && score.scoringMode === 'model';

  let interviewId: string | null = null;
  let verificationId = generateVerificationId();
  let practiceDebited = false;

  try {
    const existing = await db.interviewSession.findUnique({
      where: { id: sessionId! },
      select: {
        id: true,
        prequalId: true,
        practiceDebited: true,
        startedAt: true,
        fullReport: true,
      },
    });
    if (!existing) {
      return { ok: false, error: 'Session missing', upgradeRequired: false };
    }
    practiceDebited = existing.practiceDebited;

    const priorReport =
      existing.fullReport && typeof existing.fullReport === 'object'
        ? (existing.fullReport as Record<string, unknown>)
        : {};

    await db.interviewPrequal.update({
      where: { id: existing.prequalId },
      data: {
        completedAt: new Date(),
        numQuestions: Math.min(
          cfg.engine.maxQuestions,
          Math.max(
            cfg.engine.minQuestions,
            opts.history.filter((m) => m.role === 'assistant').length,
          ),
        ),
        generatedPlan: {
          engine: COACH_ENGINE,
          prep: opts.prep,
          coachName,
          history: opts.history,
          score,
        },
      },
    });

    await db.interviewSession.update({
      where: { id: existing.id },
      data: {
        status: 'completed',
        language: opts.prep.language,
        numQuestionsAnswered: opts.history.filter((m) => m.role === 'user').length,
        startedAt: existing.startedAt || new Date(Date.now() - 20 * 60 * 1000),
        completedAt: new Date(),
        overallScore: score.overallScore / 10,
        strengths: score.strengths.slice(0, 3),
        weaknesses: score.improvements.slice(0, 3),
        actionItems: { recommendedNextSteps: score.recommendedNextSteps },
        fullReport: {
          ...priorReport,
          engine: COACH_ENGINE,
          prep: opts.prep,
          coachName,
          score,
          history: opts.history,
          grade: score.grade,
          competencyBreakdown: score.competencyBreakdown,
          scoringMode: score.scoringMode,
        },
      },
    });

    if (!practiceDebited) {
      try {
        const debit = await debitPractice(opts.userId);
        if (debit.ok && debit.debited) {
          await db.interviewSession.update({
            where: { id: existing.id },
            data: { practiceDebited: true },
          });
          practiceDebited = true;
        }
      } catch (err) {
        console.error('[coach/complete] debit failed', err);
      }
    }

    const industryLabel =
      cfg.industries.find((i) => i.id === opts.prep.industry)?.en || opts.prep.industry;
    const roleLabel =
      cfg.roles.find((r) => r.id === opts.prep.role)?.en || opts.prep.role;
    void roleLabel;

    const interview = await db.interview.create({
      data: {
        userId: opts.userId,
        mode: 'AI',
        type: 'BEHAVIORAL',
        industry: industryLabel,
        experience: mapExperience(opts.prep.seniority),
        position: `coach-session:${existing.id}`,
        language: mapLanguage(opts.prep.language),
        interviewerGender: opts.prep.coachGender === 'male' ? 'MALE' : 'FEMALE',
        status: 'COMPLETED',
        overallScore: score.overallScore,
        contentScore:
          score.competencyBreakdown.find((c) => c.name === 'Communication')?.score ??
          null,
        clarityScore:
          score.competencyBreakdown.find((c) => c.name === 'Technical Depth')?.score ??
          null,
        confidenceScore:
          score.competencyBreakdown.find((c) => c.name === 'Confidence')?.score ?? null,
        culturalFitScore:
          score.competencyBreakdown.find((c) => c.name === 'Cultural Fit')?.score ??
          null,
        feedback: score.recommendedNextSteps,
        strengths: JSON.stringify(score.strengths.slice(0, 3)),
        improvements: JSON.stringify(score.improvements.slice(0, 3)),
        recommendation: score.grade,
        verificationId,
        sessionDebited: practiceDebited,
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
      },
    });
    interviewId = interview.id;

    try {
      await db.message.createMany({
        data: opts.history.map((m, i) => ({
          interviewId: interview.id,
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
          sequence: i + 1,
        })),
      });
    } catch (err) {
      console.error('[coach/complete] messages failed', err);
    }
  } catch (err) {
    console.error('[coach/complete] persistence failed', err);
    await trackCoachEvent(opts.userId, 'coach.complete', {
      sessionId,
      scoringMode: score.scoringMode,
      persisted: false,
    });
    return {
      ok: true,
      score,
      gateLabel: access.gateLabel,
      passportPdfUnlocked,
      emailed: false,
      upgradeRequired: !passportPdfUnlocked,
      error: 'Saved score locally; database write failed safely.',
      verificationId,
      sessionId: sessionId || undefined,
      interviewId: interviewId || undefined,
    };
  }

  let emailed = false;
  if (access.gate.emailPassport && passportPdfUnlocked && interviewId) {
    try {
      const preferAr = opts.prep.language === 'ar' || opts.prep.language === 'mixed';
      const roleOpt = cfg.roles.find((r) => r.id === opts.prep.role);
      const industryOpt = cfg.industries.find((i) => i.id === opts.prep.industry);
      const seniorityOpt = cfg.seniority.find((s) => s.id === opts.prep.seniority);
      const languageOpt = cfg.languages.find((l) => l.id === opts.prep.language);
      const pdf = await buildPassportPdfBuffer({
        candidateName: opts.candidateName,
        role: (preferAr ? roleOpt?.ar : roleOpt?.en) || opts.prep.role,
        industry:
          (preferAr ? industryOpt?.ar : industryOpt?.en) || opts.prep.industry,
        seniority:
          (preferAr ? seniorityOpt?.ar : seniorityOpt?.en) ||
          opts.prep.seniority,
        language:
          (preferAr ? languageOpt?.ar : languageOpt?.en) || opts.prep.language,
        interviewDate: new Date().toISOString().slice(0, 10),
        score,
        verificationId,
        verifyUrl: `${cfg.brand.verifyBaseUrl}/${verificationId}`,
        rtl: preferAr,
      });

      let partnerBrand: { fromName?: string | null; replyTo?: string | null } | undefined;
      try {
        const { db: prisma } = await import('@/lib/db');
        const u = await prisma.user.findUnique({
          where: { id: opts.userId },
          select: {
            partnerId: true,
            partner: {
              select: { fromEmailName: true, supportEmail: true, name: true },
            },
          },
        });
        if (u?.partner) {
          partnerBrand = {
            fromName: u.partner.fromEmailName || u.partner.name,
            replyTo: u.partner.supportEmail,
          };
        }
      } catch {
        /* ignore */
      }

      const mail = await sendPassportViaBrevo({
        to: opts.userEmail,
        language: opts.prep.language,
        name: opts.candidateName,
        overallScore: score.overallScore,
        grade: score.grade,
        pdf,
        partnerBrand,
      });
      emailed = !!mail.success;
    } catch (err) {
      console.error('[coach/complete] passport email failed', err);
    }
  }

  await trackCoachEvent(opts.userId, 'coach.complete', {
    sessionId,
    interviewId,
    scoringMode: score.scoringMode,
    overallScore: score.overallScore,
    passportPdfUnlocked,
    emailed,
  });

  // Partner webhooks (white-label) — best-effort, never blocks completion.
  try {
    const { deliverPartnerWebhooks } = await import('@/lib/partner/webhooks');
    const { db: prisma } = await import('@/lib/db');
    const user = await prisma.user.findUnique({
      where: { id: opts.userId },
      select: { partnerId: true },
    });
    if (user?.partnerId) {
      await deliverPartnerWebhooks({
        partnerId: user.partnerId,
        event: 'interview.completed',
        payload: {
          interviewId,
          sessionId,
          verificationId,
          overallScore: score.overallScore,
          grade: score.grade,
          role: opts.prep.role,
          industry: opts.prep.industry,
          engine: 'jeannie-coach',
        },
      });
      await deliverPartnerWebhooks({
        partnerId: user.partnerId,
        event: 'candidate.scored',
        payload: {
          interviewId,
          overallScore: score.overallScore,
          grade: score.grade,
          userId: opts.userId,
        },
      });
    }
  } catch (err) {
    console.error('[coach/complete] partner webhook failed', err);
  }

  return {
    ok: true,
    interviewId: interviewId || undefined,
    verificationId,
    sessionId: sessionId || undefined,
    score,
    gateLabel: access.gateLabel,
    passportPdfUnlocked,
    emailed,
    upgradeRequired: !passportPdfUnlocked,
  };
}

/** @deprecated kept for rare callers that still invent a client session id */
export function newClientSessionId(): string {
  return randomUUID();
}
