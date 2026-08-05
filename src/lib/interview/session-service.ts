import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { evaluateAnswer } from '@/lib/ai/interviewer';
import { generateFinalReport } from '@/lib/ai/report-generator';
import type { InterviewPlan, PlanQuestion } from './plan-generator';
import { memoryStore } from './memory-store';

export async function getSessionBundle(sessionId: string, userId: string) {
  try {
    const session = await db.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        prequal: true,
        responses: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (session) {
      return {
        source: 'db' as const,
        session,
        plan: (session.prequal.generatedPlan || null) as InterviewPlan | null,
      };
    }
  } catch {
    // memory
  }

  const mem = memoryStore.getSession(sessionId);
  if (!mem || mem.userId !== userId) return null;
  const prequal = memoryStore.getPrequal(mem.prequalId);
  return {
    source: 'memory' as const,
    session: mem,
    plan: (prequal?.generatedPlan || null) as InterviewPlan | null,
    prequal,
  };
}

export async function startSession(sessionId: string, userId: string) {
  const bundle = await getSessionBundle(sessionId, userId);
  if (!bundle?.plan) throw new Error('Session not found');

  if (bundle.source === 'db') {
    const updated = await db.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'active',
        startedAt: bundle.session.startedAt ?? new Date(),
      },
    });
    const first = bundle.plan.questions[0];
    return { session: updated, firstQuestion: first, plan: bundle.plan };
  }

  const mem = bundle.session;
  mem.status = 'active';
  mem.startedAt = mem.startedAt ?? new Date().toISOString();
  mem.updatedAt = new Date().toISOString();
  memoryStore.saveSession(mem);
  return {
    session: mem,
    firstQuestion: bundle.plan.questions[0],
    plan: bundle.plan,
  };
}

function planQuestion(
  plan: InterviewPlan,
  questionId: string,
): PlanQuestion | undefined {
  return plan.questions.find((q) => q.questionId === questionId);
}

export async function submitAnswer(params: {
  sessionId: string;
  userId: string;
  questionId: string;
  userAnswer: string;
  timeTakenSeconds: number;
  startedAt?: string;
}) {
  const bundle = await getSessionBundle(params.sessionId, params.userId);
  if (!bundle?.plan) throw new Error('Session not found');
  if (bundle.session.status === 'completed') throw new Error('Session already completed');

  const q = planQuestion(bundle.plan, params.questionId);
  if (!q) throw new Error('Question not in plan');

  const prequal =
    bundle.source === 'db'
      ? bundle.session.prequal
      : bundle.prequal;

  const feedback = await evaluateAnswer({
    role: prequal?.targetRole || 'general',
    level: prequal?.seniorityLevel || 'mid',
    round: prequal?.interviewRound || 'full_mock',
    language: bundle.plan.language,
    industry: prequal?.targetIndustry,
    weakness: prequal?.weaknessFocus,
    question: q.questionText,
    questionType: q.type,
    timeLimit: q.timeLimit,
    timeTaken: params.timeTakenSeconds,
    answer: params.userAnswer,
  });

  const needFollowUp =
    Boolean(feedback.followUpQuestion) && feedback.overallScore < 6;

  if (bundle.source === 'db') {
    const response = await db.interviewResponse.create({
      data: {
        sessionId: params.sessionId,
        questionId: params.questionId,
        questionOrder: q.order,
        userAnswer: params.userAnswer,
        contentScore: feedback.contentScore,
        structureScore: feedback.structureScore,
        confidenceScore: feedback.confidenceScore,
        overallScore: feedback.overallScore,
        feedbackText: feedback.feedbackText,
        feedbackTextAr: feedback.feedbackTextAr,
        improvementTip: feedback.improvementTip,
        improvementTipAr: feedback.improvementTipAr,
        rawAiResponse: feedback.raw as object,
        timeTakenSeconds: params.timeTakenSeconds,
        startedAt: params.startedAt ? new Date(params.startedAt) : new Date(),
        completedAt: new Date(),
        followUpCount: 0,
      },
    });

    const answered = await db.interviewResponse.count({
      where: { sessionId: params.sessionId },
    });

    await db.interviewSession.update({
      where: { id: params.sessionId },
      data: {
        status: 'active',
        numQuestionsAnswered: answered,
        currentQuestionIndex: Math.min(answered, bundle.plan.numQuestions - 1),
        strengths: [...bundle.session.strengths, ...feedback.strengths].slice(0, 20),
        weaknesses: [...bundle.session.weaknesses, ...feedback.weaknesses].slice(0, 20),
      },
    });

    const isLast = answered >= bundle.plan.numQuestions && !needFollowUp;
    let nextAction: 'follow_up' | 'next_question' | 'final_report' = 'next_question';
    if (needFollowUp) nextAction = 'follow_up';
    else if (isLast) nextAction = 'final_report';

    const nextQuestion =
      nextAction === 'next_question'
        ? bundle.plan.questions.find((pq) => pq.order === q.order + 1)
        : undefined;

    if (nextAction === 'final_report') {
      await finalizeReport(params.sessionId, params.userId);
    }

    return {
      responseId: response.id,
      feedback,
      nextAction,
      nextQuestion,
      followUpQuestion: needFollowUp
        ? bundle.plan.language === 'arabic'
          ? feedback.followUpQuestionAr || feedback.followUpQuestion
          : feedback.followUpQuestion
        : null,
    };
  }

  // memory path
  const mem = bundle.session;
  const responseId = randomUUID();
  mem.responses.push({
    id: responseId,
    sessionId: mem.id,
    questionId: params.questionId,
    questionOrder: q.order,
    userAnswer: params.userAnswer,
    contentScore: feedback.contentScore,
    structureScore: feedback.structureScore,
    confidenceScore: feedback.confidenceScore,
    overallScore: feedback.overallScore,
    feedbackText: feedback.feedbackText,
    feedbackTextAr: feedback.feedbackTextAr,
    improvementTip: feedback.improvementTip,
    improvementTipAr: feedback.improvementTipAr,
    rawAiResponse: feedback.raw,
    timeTakenSeconds: params.timeTakenSeconds,
    startedAt: params.startedAt || new Date().toISOString(),
    completedAt: new Date().toISOString(),
    followUpCount: 0,
  });
  mem.numQuestionsAnswered = mem.responses.length;
  mem.currentQuestionIndex = Math.min(
    mem.responses.length,
    bundle.plan.numQuestions - 1,
  );
  mem.strengths = [...mem.strengths, ...feedback.strengths];
  mem.weaknesses = [...mem.weaknesses, ...feedback.weaknesses];
  mem.status = 'active';
  mem.updatedAt = new Date().toISOString();
  memoryStore.saveSession(mem);

  const isLast =
    mem.responses.length >= bundle.plan.numQuestions && !needFollowUp;
  let nextAction: 'follow_up' | 'next_question' | 'final_report' = 'next_question';
  if (needFollowUp) nextAction = 'follow_up';
  else if (isLast) nextAction = 'final_report';

  if (nextAction === 'final_report') {
    await finalizeReport(params.sessionId, params.userId);
  }

  return {
    responseId,
    feedback,
    nextAction,
    nextQuestion:
      nextAction === 'next_question'
        ? bundle.plan.questions.find((pq) => pq.order === q.order + 1)
        : undefined,
    followUpQuestion: needFollowUp
      ? bundle.plan.language === 'arabic'
        ? feedback.followUpQuestionAr || feedback.followUpQuestion
        : feedback.followUpQuestion
      : null,
  };
}

export async function submitFollowUp(params: {
  sessionId: string;
  userId: string;
  questionId: string;
  followUpAnswer: string;
}) {
  const bundle = await getSessionBundle(params.sessionId, params.userId);
  if (!bundle?.plan) throw new Error('Session not found');
  const q = planQuestion(bundle.plan, params.questionId);
  if (!q) throw new Error('Question not in plan');

  const prequal =
    bundle.source === 'db' ? bundle.session.prequal : bundle.prequal;

  if (bundle.source === 'db') {
    const response = await db.interviewResponse.findFirst({
      where: { sessionId: params.sessionId, questionId: params.questionId },
      orderBy: { createdAt: 'desc' },
    });
    if (!response) throw new Error('Answer the main question first');
    if (response.followUpCount >= 2) {
      throw new Error('Maximum follow-ups reached');
    }

    const feedback = await evaluateAnswer({
      role: prequal?.targetRole || 'general',
      level: prequal?.seniorityLevel || 'mid',
      round: prequal?.interviewRound || 'full_mock',
      language: bundle.plan.language,
      industry: prequal?.targetIndustry,
      weakness: prequal?.weaknessFocus,
      question: q.questionText,
      questionType: q.type,
      timeLimit: q.timeLimit,
      timeTaken: 0,
      answer: params.followUpAnswer,
      isFollowUp: true,
    });

    const prev =
      (response.followUpResponses as unknown[] | null) ?? [];
    const followUpCount = response.followUpCount + 1;
    await db.interviewResponse.update({
      where: { id: response.id },
      data: {
        followUpCount,
        followUpResponses: [
          ...prev,
          {
            answer: params.followUpAnswer,
            feedback,
            at: new Date().toISOString(),
          },
        ] as object[],
        // Blend scores slightly upward if follow-up improves
        overallScore: Math.min(
          10,
          ((response.overallScore ?? feedback.overallScore) + feedback.overallScore) / 2,
        ),
      },
    });

    const answered = await db.interviewResponse.count({
      where: { sessionId: params.sessionId },
    });
    const moreFollowUp =
      followUpCount < 2 &&
      Boolean(feedback.followUpQuestion) &&
      feedback.overallScore < 6;
    const isLast = answered >= bundle.plan.numQuestions && !moreFollowUp;
    let nextAction: 'follow_up' | 'next_question' | 'final_report' = 'next_question';
    if (moreFollowUp) nextAction = 'follow_up';
    else if (isLast) nextAction = 'final_report';

    if (nextAction === 'final_report') {
      await finalizeReport(params.sessionId, params.userId);
    }

    return {
      feedback,
      nextAction,
      nextQuestion:
        nextAction === 'next_question'
          ? bundle.plan.questions.find((pq) => pq.order === q.order + 1)
          : undefined,
      followUpQuestion: moreFollowUp
        ? bundle.plan.language === 'arabic'
          ? feedback.followUpQuestionAr || feedback.followUpQuestion
          : feedback.followUpQuestion
        : null,
    };
  }

  const mem = bundle.session;
  const response = [...mem.responses]
    .reverse()
    .find((r) => r.questionId === params.questionId);
  if (!response) throw new Error('Answer the main question first');
  if (response.followUpCount >= 2) throw new Error('Maximum follow-ups reached');

  const feedback = await evaluateAnswer({
    role: prequal?.targetRole || 'general',
    level: prequal?.seniorityLevel || 'mid',
    round: prequal?.interviewRound || 'full_mock',
    language: bundle.plan.language,
    industry: prequal?.targetIndustry,
    weakness: prequal?.weaknessFocus,
    question: q.questionText,
    questionType: q.type,
    timeLimit: q.timeLimit,
    timeTaken: 0,
    answer: params.followUpAnswer,
    isFollowUp: true,
  });

  const prev = (response.followUpResponses as unknown[] | null) ?? [];
  response.followUpCount += 1;
  response.followUpResponses = [
    ...prev,
    { answer: params.followUpAnswer, feedback, at: new Date().toISOString() },
  ];
  response.overallScore = Math.min(
    10,
    ((response.overallScore ?? feedback.overallScore) + feedback.overallScore) / 2,
  );
  mem.updatedAt = new Date().toISOString();
  memoryStore.saveSession(mem);

  const moreFollowUp =
    response.followUpCount < 2 &&
    Boolean(feedback.followUpQuestion) &&
    feedback.overallScore < 6;
  const isLast =
    mem.responses.length >= bundle.plan.numQuestions && !moreFollowUp;
  let nextAction: 'follow_up' | 'next_question' | 'final_report' = 'next_question';
  if (moreFollowUp) nextAction = 'follow_up';
  else if (isLast) nextAction = 'final_report';

  if (nextAction === 'final_report') {
    await finalizeReport(params.sessionId, params.userId);
  }

  return {
    feedback,
    nextAction,
    nextQuestion:
      nextAction === 'next_question'
        ? bundle.plan.questions.find((pq) => pq.order === q.order + 1)
        : undefined,
    followUpQuestion: moreFollowUp
      ? bundle.plan.language === 'arabic'
        ? feedback.followUpQuestionAr || feedback.followUpQuestion
        : feedback.followUpQuestion
      : null,
  };
}

export async function finalizeReport(sessionId: string, userId: string) {
  const bundle = await getSessionBundle(sessionId, userId);
  if (!bundle?.plan) throw new Error('Session not found');

  if (bundle.source === 'db') {
    if (bundle.session.fullReport) return bundle.session.fullReport;
    const responses = bundle.session.responses.map((r) => {
      const q = planQuestion(bundle.plan!, r.questionId);
      return {
        questionId: r.questionId,
        questionText: q?.questionTextEn || q?.questionText || r.questionId,
        questionTextAr: q?.questionTextAr,
        userAnswer: r.userAnswer,
        contentScore: r.contentScore,
        structureScore: r.structureScore,
        confidenceScore: r.confidenceScore,
        overallScore: r.overallScore,
        feedbackText: r.feedbackText,
        improvementTip: r.improvementTip,
      };
    });

    const report = await generateFinalReport({
      role: bundle.session.prequal.targetRole,
      level: bundle.session.prequal.seniorityLevel,
      language: bundle.session.language,
      responses,
      strengthHints: bundle.session.strengths,
      weaknessHints: bundle.session.weaknesses,
    });

    const started = bundle.session.startedAt?.getTime() ?? Date.now();
    await db.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        overallScore: report.overallScore,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        actionItems: report.actionItems as object,
        fullReport: report as object,
        totalDurationSeconds: Math.round((Date.now() - started) / 1000),
      },
    });
    return report;
  }

  const mem = bundle.session;
  if (mem.fullReport) return mem.fullReport;
  const prequal = bundle.prequal;
  const responses = mem.responses.map((r) => {
    const q = planQuestion(bundle.plan!, r.questionId);
    return {
      questionId: r.questionId,
      questionText: q?.questionTextEn || q?.questionText || r.questionId,
      questionTextAr: q?.questionTextAr,
      userAnswer: r.userAnswer,
      contentScore: r.contentScore,
      structureScore: r.structureScore,
      confidenceScore: r.confidenceScore,
      overallScore: r.overallScore,
      feedbackText: r.feedbackText,
      improvementTip: r.improvementTip,
    };
  });

  const report = await generateFinalReport({
    role: prequal?.targetRole || 'general',
    level: prequal?.seniorityLevel || 'mid',
    language: mem.language,
    responses,
    strengthHints: mem.strengths,
    weaknessHints: mem.weaknesses,
  });

  mem.status = 'completed';
  mem.completedAt = new Date().toISOString();
  mem.overallScore = report.overallScore;
  mem.strengths = report.strengths;
  mem.weaknesses = report.weaknesses;
  mem.actionItems = report.actionItems;
  mem.fullReport = report;
  mem.updatedAt = new Date().toISOString();
  if (mem.startedAt) {
    mem.totalDurationSeconds = Math.round(
      (Date.now() - new Date(mem.startedAt).getTime()) / 1000,
    );
  }
  memoryStore.saveSession(mem);
  return report;
}
