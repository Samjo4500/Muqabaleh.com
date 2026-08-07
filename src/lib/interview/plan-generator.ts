import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import {
  DURATION_OPTIONS,
  FOCUS_MAP,
  INDUSTRY_OPTIONS,
  ROLE_OPTIONS,
  WEAKNESS_TIPS,
  labelFor,
} from './constants';
import {
  annotatePositions,
  sequenceQuestions,
  type BankQuestion,
} from './question-sequencer';
import { getDefaultTime, getDifficultyRange } from './scoring';
import { FALLBACK_QUESTIONS, memoryStore, type MemPrequal } from './memory-store';
import type { CompanyMockContext } from './company-mock';

export type PrequalInput = {
  userId: string;
  userEmail: string;
  sessionId?: string;
  targetRole: string;
  seniorityLevel: string;
  questionTypes: string[];
  interviewRound: string;
  languagePreference: string;
  targetIndustry?: string | null;
  weaknessFocus?: string | null;
  durationPreset: string;
  companyMock?: CompanyMockContext | null;
};

export type PlanQuestion = {
  order: number;
  questionId: string;
  type: string;
  questionText: string;
  questionTextEn: string;
  questionTextAr: string | null;
  difficulty: string;
  timeLimit: number;
  followUps: unknown;
  coachingNote?: string;
  evaluationRubric: unknown;
  positionType: string;
};

export type InterviewPlan = {
  title: string;
  language: string;
  estimatedDuration: number;
  numQuestions: number;
  focusAreas: string[];
  coachingTips: string[];
  questions: PlanQuestion[];
  /** Present when practicing from a listed job / company page */
  companyMock?: CompanyMockContext | null;
};

function durationMeta(preset: string) {
  return (
    DURATION_OPTIONS.find((d) => d.value === preset) ?? {
      numQuestions: 8,
      estimatedDurationMin: 20,
    }
  );
}

async function loadCandidateQuestions(
  prequal: Pick<PrequalInput, 'targetRole' | 'seniorityLevel' | 'questionTypes' | 'interviewRound'>,
  numQuestions: number,
): Promise<BankQuestion[]> {
  const difficulties = getDifficultyRange(prequal.seniorityLevel, prequal.interviewRound);
  const rounds =
    prequal.interviewRound === 'full_mock'
      ? ['phone_screen', 'technical', 'behavioral', 'final']
      : [prequal.interviewRound];

  try {
    const primary = await db.interviewQuestion.findMany({
      where: {
        OR: [
          {
            roleCategory: prequal.targetRole,
            seniorityLevel: prequal.seniorityLevel,
            questionType: { in: prequal.questionTypes },
            interviewRound: { in: rounds },
            difficulty: { in: difficulties },
          },
          {
            roleCategory: prequal.targetRole,
            questionType: { in: prequal.questionTypes },
            difficulty: { in: difficulties },
          },
        ],
      },
      orderBy: { usageCount: 'asc' },
      take: numQuestions * 3,
    });

    let pool = primary as BankQuestion[];
    if (pool.length < numQuestions) {
      const general = await db.interviewQuestion.findMany({
        where: {
          roleCategory: 'general',
          difficulty: { in: difficulties },
        },
        orderBy: { usageCount: 'asc' },
        take: numQuestions * 2,
      });
      const ids = new Set(pool.map((q) => q.id));
      for (const q of general) {
        if (!ids.has(q.id)) pool.push(q as BankQuestion);
      }
    }

    if (pool.length < numQuestions) {
      const any = await db.interviewQuestion.findMany({
        orderBy: { usageCount: 'asc' },
        take: numQuestions * 3,
      });
      const ids = new Set(pool.map((q) => q.id));
      for (const q of any) {
        if (!ids.has(q.id)) pool.push(q as BankQuestion);
      }
    }

    if (pool.length) return pool;
  } catch {
    // fall through
  }

  return FALLBACK_QUESTIONS.filter((q) => {
    const roleOk = q.roleCategory === prequal.targetRole || q.roleCategory === 'general';
    const typeOk =
      prequal.questionTypes.length === 0 || prequal.questionTypes.includes(q.questionType);
    return roleOk && typeOk;
  }).slice(0, Math.max(numQuestions * 3, 15));
}

export async function buildInterviewPlan(
  prequal: PrequalInput & { numQuestions?: number; estimatedDurationMin?: number },
): Promise<InterviewPlan> {
  const dur = durationMeta(prequal.durationPreset);
  const numQuestions = prequal.numQuestions ?? dur.numQuestions;
  const estimatedDuration = prequal.estimatedDurationMin ?? dur.estimatedDurationMin;
  const candidates = await loadCandidateQuestions(prequal, numQuestions);
  const sequenced = sequenceQuestions(candidates, numQuestions);
  const annotated = annotatePositions(sequenced);
  const weaknessTips = prequal.weaknessFocus
    ? WEAKNESS_TIPS[prequal.weaknessFocus] ?? []
    : [];
  const preferAr = prequal.languagePreference === 'arabic';
  const roleEn = labelFor(ROLE_OPTIONS, prequal.targetRole, 'en');
  const mock = prequal.companyMock ?? null;
  const title = mock
    ? `${mock.companyName} · ${mock.roleTitle}`
    : `${prequal.seniorityLevel} ${roleEn} — ${prequal.interviewRound}`;

  const companyTips = mock
    ? [
        `You are interviewing for ${mock.roleTitle} at ${mock.companyName}. Frame answers for that employer and role.`,
        mock.jobDescription
          ? `Role context (snippet): ${mock.jobDescription}`
          : `Emphasize why you fit ${mock.companyName} and this role specifically.`,
      ]
    : [];

  const plan: InterviewPlan = {
    title,
    language: prequal.languagePreference,
    estimatedDuration,
    numQuestions,
    focusAreas: prequal.questionTypes.map((t) => FOCUS_MAP[t] ?? t),
    coachingTips: [...companyTips, ...weaknessTips],
    companyMock: mock,
    questions: annotated.map((q) => {
      const tips = [
        ...(q.coachingTips ?? []),
        ...(weaknessTips.length ? [weaknessTips[0]] : []),
      ];
      return {
        order: q.order,
        questionId: q.id,
        type: q.questionType,
        questionText: preferAr ? q.questionTextAr || q.questionText : q.questionText,
        questionTextEn: q.questionText,
        questionTextAr: q.questionTextAr,
        difficulty: q.difficulty,
        timeLimit:
          q.timeLimitSeconds || getDefaultTime(q.difficulty, prequal.seniorityLevel),
        followUps: q.followUpQuestions,
        coachingNote: tips[0],
        evaluationRubric: q.evaluationRubric,
        positionType: q.positionType,
      };
    }),
  };

  if (prequal.targetIndustry) {
    const ind = labelFor(INDUSTRY_OPTIONS, prequal.targetIndustry, 'en');
    plan.coachingTips = [
      `Tailor examples to the ${ind} industry when possible.`,
      ...plan.coachingTips,
    ];
  }

  return plan;
}

export async function savePrequal(input: PrequalInput): Promise<{
  prequalId: string;
  sessionId: string;
  numQuestions: number;
  estimatedDurationMin: number;
}> {
  if (!input.userEmail?.includes('@')) {
    throw new Error('Email is required');
  }
  const dur = durationMeta(input.durationPreset);
  const clientSessionId = input.sessionId || randomUUID();
  const roleAr = labelFor(ROLE_OPTIONS, input.targetRole, 'ar');

  try {
    const saved = await db.interviewPrequal.create({
      data: {
        userId: input.userId,
        userEmail: input.userEmail,
        sessionId: clientSessionId,
        targetRole: input.targetRole,
        targetRoleAr: roleAr,
        seniorityLevel: input.seniorityLevel,
        questionTypes: input.questionTypes,
        interviewRound: input.interviewRound,
        languagePreference: input.languagePreference,
        targetIndustry: input.targetIndustry ?? null,
        targetIndustryAr: input.targetIndustry
          ? labelFor(INDUSTRY_OPTIONS, input.targetIndustry, 'ar')
          : null,
        weaknessFocus: input.weaknessFocus ?? null,
        durationPreset: input.durationPreset,
        numQuestions: dur.numQuestions,
        estimatedDurationMin: dur.estimatedDurationMin,
      },
    });
    return {
      prequalId: saved.id,
      sessionId: saved.sessionId,
      numQuestions: dur.numQuestions,
      estimatedDurationMin: dur.estimatedDurationMin,
    };
  } catch {
    const id = randomUUID();
    const mem: MemPrequal = {
      id,
      userId: input.userId,
      userEmail: input.userEmail,
      sessionId: clientSessionId,
      targetRole: input.targetRole,
      targetRoleAr: roleAr,
      seniorityLevel: input.seniorityLevel,
      questionTypes: input.questionTypes,
      interviewRound: input.interviewRound,
      languagePreference: input.languagePreference,
      targetIndustry: input.targetIndustry ?? null,
      weaknessFocus: input.weaknessFocus ?? null,
      durationPreset: input.durationPreset,
      numQuestions: dur.numQuestions,
      estimatedDurationMin: dur.estimatedDurationMin,
      createdAt: new Date().toISOString(),
    };
    memoryStore.savePrequal(mem);
    return {
      prequalId: id,
      sessionId: clientSessionId,
      numQuestions: dur.numQuestions,
      estimatedDurationMin: dur.estimatedDurationMin,
    };
  }
}

async function resolveCompanyMock(
  input?: CompanyMockContext | null,
): Promise<CompanyMockContext | null> {
  if (!input) return null;
  if (input.jobDescription || !input.jobId) return input;
  try {
    const job = await db.listedJob.findFirst({
      where: { id: input.jobId, isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        company: { select: { name: true } },
      },
    });
    if (!job) return input;
    return {
      companyName: input.companyName || job.company?.name || 'Company',
      roleTitle: input.roleTitle || job.title,
      jobId: job.id,
      jobDescription: (job.description || '').slice(0, 300) || null,
    };
  } catch {
    return input;
  }
}

async function recordJobMockInterview(
  userId: string,
  mock: CompanyMockContext | null,
) {
  if (!mock?.jobId) return;
  try {
    await db.jobMockInterview.create({
      data: {
        userId,
        jobId: mock.jobId,
        type: 'COMPANY_SPECIFIC',
      },
    });
  } catch {
    // non-blocking — job may have been deactivated
  }
}

export async function generatePlanForPrequalId(
  prequalId: string,
  userId: string,
  companyMock?: CompanyMockContext | null,
): Promise<{ plan: InterviewPlan; sessionId: string; prequalId: string }> {
  const resolvedMock = await resolveCompanyMock(companyMock ?? null);

  // DB path
  try {
    const existing = await db.interviewPrequal.findFirst({
      where: { id: prequalId, userId },
      include: { interviewSession: true },
    });
    if (existing) {
      const cached = existing.generatedPlan as InterviewPlan | null;
      if (cached && existing.interviewSession && (!resolvedMock || cached.companyMock)) {
        return {
          plan: cached,
          sessionId: existing.interviewSession.id,
          prequalId: existing.id,
        };
      }

      const plan = await buildInterviewPlan({
        userId: existing.userId,
        userEmail: existing.userEmail,
        sessionId: existing.sessionId,
        targetRole: existing.targetRole,
        seniorityLevel: existing.seniorityLevel,
        questionTypes: existing.questionTypes,
        interviewRound: existing.interviewRound,
        languagePreference: existing.languagePreference,
        targetIndustry: existing.targetIndustry,
        weaknessFocus: existing.weaknessFocus,
        durationPreset: existing.durationPreset,
        numQuestions: existing.numQuestions,
        estimatedDurationMin: existing.estimatedDurationMin,
        companyMock: resolvedMock,
      });

      await db.interviewPrequal.update({
        where: { id: existing.id },
        data: { generatedPlan: plan as object, completedAt: new Date() },
      });

      const session =
        existing.interviewSession ??
        (await db.interviewSession.create({
          data: {
            userId: existing.userId,
            prequalId: existing.id,
            status: 'pending',
            language: existing.languagePreference,
            numQuestionsTotal: existing.numQuestions,
          },
        }));

      await Promise.all(
        plan.questions.map((q) =>
          db.interviewQuestion
            .update({
              where: { id: q.questionId },
              data: { usageCount: { increment: 1 } },
            })
            .catch(() => undefined),
        ),
      );

      await recordJobMockInterview(userId, resolvedMock);

      return { plan, sessionId: session.id, prequalId: existing.id };
    }
  } catch {
    // memory fallback
  }

  const mem = memoryStore.getPrequal(prequalId);
  if (!mem || mem.userId !== userId) {
    throw new Error('Prequal not found');
  }

  const existingSession = memoryStore.findSessionByPrequal(prequalId);
  const cachedMem = mem.generatedPlan as InterviewPlan | undefined;
  if (cachedMem && existingSession && (!resolvedMock || cachedMem.companyMock)) {
    return {
      plan: cachedMem,
      sessionId: existingSession.id,
      prequalId,
    };
  }

  const plan = await buildInterviewPlan({
    userId: mem.userId,
    userEmail: mem.userEmail,
    sessionId: mem.sessionId,
    targetRole: mem.targetRole,
    seniorityLevel: mem.seniorityLevel,
    questionTypes: mem.questionTypes,
    interviewRound: mem.interviewRound,
    languagePreference: mem.languagePreference,
    targetIndustry: mem.targetIndustry,
    weaknessFocus: mem.weaknessFocus,
    durationPreset: mem.durationPreset,
    numQuestions: mem.numQuestions,
    estimatedDurationMin: mem.estimatedDurationMin,
    companyMock: resolvedMock,
  });

  mem.generatedPlan = plan;
  memoryStore.savePrequal(mem);

  const sessionId = existingSession?.id ?? randomUUID();
  memoryStore.saveSession({
    id: sessionId,
    userId: mem.userId,
    prequalId,
    status: 'pending',
    language: mem.languagePreference,
    numQuestionsTotal: mem.numQuestions,
    numQuestionsAnswered: 0,
    currentQuestionIndex: 0,
    strengths: [],
    weaknesses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responses: [],
  });

  await recordJobMockInterview(userId, resolvedMock);

  return { plan, sessionId, prequalId };
}
