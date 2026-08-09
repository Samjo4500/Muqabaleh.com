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
 * Score transcript, persist into existing tables only, optionally email PDF.
 * Never throws — returns safe fallback on DB errors.
 */
export async function completeCoachInterview(opts: {
  userId: string;
  userEmail: string;
  candidateName: string;
  prep: PrepSelections;
  history: ChatMessage[];
}): Promise<CompleteResult> {
  const cfg = getInterviewConfig();
  const access = await getCoachAccess(opts.userId);

  // Free users who already used their interview: still allow viewing if this
  // is a first completion path; gate checked at start. If somehow past limit,
  // still score but mark upgrade.
  const score = await scoreTranscript(opts.prep, transcriptFrom(opts.history));
  const coachName = resolveCoachName(opts.prep.coachGender);
  const clientSessionId = randomUUID();

  let prequalId: string | null = null;
  let sessionId: string | null = null;
  let interviewId: string | null = null;
  let verificationId = generateVerificationId();

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
        numQuestions: Math.min(
          cfg.engine.maxQuestions,
          Math.max(
            cfg.engine.minQuestions,
            opts.history.filter((m) => m.role === 'assistant').length,
          ),
        ),
        estimatedDurationMin: 20,
        generatedPlan: {
          engine: 'jeannie-coach',
          prep: opts.prep,
          coachName,
          history: opts.history,
          score,
        },
        completedAt: new Date(),
      },
    });
    prequalId = prequal.id;

    const session = await db.interviewSession.create({
      data: {
        userId: opts.userId,
        prequalId: prequal.id,
        status: 'completed',
        language: opts.prep.language,
        numQuestionsTotal: cfg.engine.maxQuestions,
        numQuestionsAnswered: opts.history.filter((m) => m.role === 'user').length,
        practiceDebited: false,
        startedAt: new Date(Date.now() - 20 * 60 * 1000),
        completedAt: new Date(),
        overallScore: score.overallScore / 10, // store 0–10 for existing engine convention
        strengths: score.strengths.slice(0, 3),
        weaknesses: score.improvements.slice(0, 3),
        actionItems: { recommendedNextSteps: score.recommendedNextSteps },
        fullReport: {
          engine: 'jeannie-coach',
          prep: opts.prep,
          coachName,
          score,
          history: opts.history,
          grade: score.grade,
          competencyBreakdown: score.competencyBreakdown,
        },
      },
    });
    sessionId = session.id;

    // Debit practice entitlement when available (never crash)
    try {
      const debit = await debitPractice(opts.userId);
      if (debit.ok && debit.debited) {
        await db.interviewSession.update({
          where: { id: session.id },
          data: { practiceDebited: true },
        });
      }
    } catch (err) {
      console.error('[coach/complete] debit failed', err);
    }

    const industryLabel =
      cfg.industries.find((i) => i.id === opts.prep.industry)?.en || opts.prep.industry;
    const roleLabel =
      cfg.roles.find((r) => r.id === opts.prep.role)?.en || opts.prep.role;

    const interview = await db.interview.create({
      data: {
        userId: opts.userId,
        mode: 'AI',
        type: 'BEHAVIORAL',
        industry: industryLabel,
        experience: mapExperience(opts.prep.seniority),
        position: `coach-session:${session.id}`,
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
        sessionDebited: true,
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
      },
    });
    interviewId = interview.id;

    // Persist transcript messages on legacy Interview
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
    // Return scored result even if DB write fails — session must not crash
    return {
      ok: true,
      score,
      gateLabel: access.gateLabel,
      passportPdfUnlocked: access.gate.passportPdf,
      emailed: false,
      upgradeRequired: !access.gate.passportPdf,
      error: 'Saved score locally; database write failed safely.',
      verificationId,
      sessionId: sessionId || undefined,
      interviewId: interviewId || undefined,
    };
  }

  // Pro/Premium only — Free never emails; always keep passport on-screen.
  let emailed = false;
  if (access.gate.emailPassport && access.gate.passportPdf && interviewId) {
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

      const mail = await sendPassportViaBrevo({
        to: opts.userEmail,
        language: opts.prep.language,
        name: opts.candidateName,
        overallScore: score.overallScore,
        grade: score.grade,
        pdf,
      });
      emailed = !!mail.success;
    } catch (err) {
      // Never block passport display / interview completion.
      console.error('[coach/complete] passport email failed', err);
    }
  }

  void prequalId;

  return {
    ok: true,
    interviewId: interviewId || undefined,
    verificationId,
    sessionId: sessionId || undefined,
    score,
    gateLabel: access.gateLabel,
    passportPdfUnlocked: access.gate.passportPdf,
    emailed,
    upgradeRequired: !access.gate.passportPdf,
  };
}
