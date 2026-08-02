import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { startInterview, generateInterviewResponse, evaluateInterview, generateVerificationId } from '@/lib/ai';
import { getDemoQuestions, type Role, LEVEL_MAP } from '@/lib/interview-questions';
import { z } from 'zod';

const IS_DEMO = process.env.DEMO_MODE === 'true';
const NO_DB = !process.env.DATABASE_URL;

const guestMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

// In-memory demo state
const demoInterviews = new Map<string, {
  id: string;
  language: string;
  status: string;
  messageCount: number;
  questions: string[];
}>();

// POST /api/guest/[token]/messages — guest candidate message flow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    // In DEMO_MODE or when no DB: use in-memory state
    if (IS_DEMO || NO_DB) {
      return handleDemoMessage(req, token);
    }

    // Production: use database
    const { db } = await import('@/lib/db');
    const interview = await db.interview.findFirst({
      where: { guestToken: token, mode: 'AI' },
    });

    if (!interview) {
      return NextResponse.json({ error: { ar: 'رابط غير صالح', en: 'Invalid link' } }, { status: 404 });
    }

    if (interview.status === 'COMPLETED') {
      return NextResponse.json({ error: { ar: 'المقابلة مكتملة', en: 'Interview completed' } }, { status: 400 });
    }

    // Rate limit (simple check, no external deps)
    if (!checkDemoRateLimit(interview.id)) {
      return NextResponse.json({ error: { ar: 'تم تجاوز الحد. انتظر قليلاً.', en: 'Rate limit exceeded.' } }, { status: 429 });
    }

    // PENDING → start
    if (interview.status === 'PENDING') {
      await db.interview.update({ where: { id: interview.id }, data: { status: 'IN_PROGRESS' } });

      const result = await startInterview(interview.id, {
        interviewerGender: interview.interviewerGender as 'MALE' | 'FEMALE',
        type: interview.type as 'BEHAVIORAL' | 'TECHNICAL',
        industry: interview.industry,
        experience: interview.experience || 'MID',
        language: interview.language as 'AR' | 'EN',
      });

      return NextResponse.json({
        question: result.question,
        questionNumber: result.questionNumber,
        totalQuestions: result.totalQuestions,
        done: false,
      });
    }

    // IN_PROGRESS → generate response
    if (interview.status === 'IN_PROGRESS') {
      const body = await req.json();
      const parsed = guestMessageSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: { ar: 'الرسالة مطلوبة', en: 'Message required' } }, { status: 400 });
      }

      const result = await generateInterviewResponse(interview.id, parsed.data.content, {
        interviewerGender: interview.interviewerGender as 'MALE' | 'FEMALE',
        type: interview.type as 'BEHAVIORAL' | 'TECHNICAL',
        industry: interview.industry,
        experience: interview.experience || 'MID',
        language: interview.language as 'AR' | 'EN',
      });

      if (result.done) {
        await db.interview.update({ where: { id: interview.id }, data: { status: 'COMPLETED' } });
        evaluateAndSaveGuest(interview.id, interview.language as 'AR' | 'EN').catch(err => {
          console.error('Guest evaluation failed:', err);
        });

        return NextResponse.json({
          question: result.question,
          questionNumber: result.questionNumber,
          totalQuestions: result.totalQuestions,
          done: true,
        });
      }

      return NextResponse.json({
        question: result.question,
        questionNumber: result.questionNumber,
        totalQuestions: result.totalQuestions,
        done: false,
      });
    }

    return NextResponse.json({ error: { ar: 'حالة غير صالحة', en: 'Invalid status' } }, { status: 400 });
  } catch (err) {
    console.error('Guest message error:', err);

    // Graceful fallback to demo if DB fails
    if (NO_DB) {
      const { token } = await params;
      return handleDemoMessage(req, token);
    }

    return NextResponse.json({ error: { ar: 'حدث خطأ', en: 'Error' } }, { status: 500 });
  }
}

// ─── Demo Mode Handler ───
async function handleDemoMessage(req: NextRequest, token: string) {
  let state = demoInterviews.get(token);

  // Auto-create if doesn't exist (e.g. fallback from DB failure)
  if (!state) {
    const defaultQs = getDemoQuestions('SOFTWARE_ENGINEER', 'MID', 'TECH', 'AR');
    state = {
      id: `demo-${crypto.randomUUID()}`,
      language: 'AR',
      status: 'PENDING',
      messageCount: 0,
      questions: defaultQs,
    };
    demoInterviews.set(token, state);
  }

  // Fallback: if questions empty, initialize with defaults
  if (!state.questions || state.questions.length === 0) {
    const defaultQs = getDemoQuestions('SOFTWARE_ENGINEER', 'MID', 'TECH', state.language as 'AR' | 'EN');
    state.questions = defaultQs;
  }

  const questions = state.questions;
  const totalQuestions = questions.length;

  if (state.status === 'COMPLETED') {
    return NextResponse.json({ error: { ar: 'المقابلة مكتملة', en: 'Interview completed' } }, { status: 400 });
  }

  // PENDING → first question
  if (state.status === 'PENDING') {
    state.status = 'IN_PROGRESS';
    state.messageCount = 1;
    return NextResponse.json({
      question: questions[0],
      questionNumber: 1,
      totalQuestions,
      done: false,
      demoMode: true,
    });
  }

  // IN_PROGRESS → next question
  const body = await req.json().catch(() => ({ content: '' }));
  const parsed = guestMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { ar: 'الرسالة مطلوبة', en: 'Message required' } }, { status: 400 });
  }

  state.messageCount++;
  const nextQIdx = Math.min(state.messageCount, totalQuestions - 1);
  const isLast = nextQIdx === totalQuestions - 1;

  if (isLast) {
    state.status = 'COMPLETED';
  }

  return NextResponse.json({
    question: questions[nextQIdx],
    questionNumber: nextQIdx + 1,
    totalQuestions,
    done: isLast,
    demoMode: true,
  });
}

function checkDemoRateLimit(_id: string): boolean {
  return true; // No rate limiting in demo mode
}

async function evaluateAndSaveGuest(interviewId: string, language: 'AR' | 'EN') {
  try {
    const evaluation = await evaluateInterview(interviewId, language);
    const verificationId = generateVerificationId();
    const expiresAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);

    const { db } = await import('@/lib/db');
    await db.interview.update({
      where: { id: interviewId },
      data: {
        overallScore: evaluation.overallScore,
        contentScore: evaluation.contentScore,
        clarityScore: evaluation.clarityScore,
        confidenceScore: evaluation.confidenceScore,
        culturalFitScore: evaluation.culturalFitScore,
        feedback: evaluation.feedback,
        strengths: JSON.stringify(evaluation.strengths),
        improvements: JSON.stringify(evaluation.improvements),
        recommendation: evaluation.recommendation,
        verificationId,
        expiresAt,
        sessionDebited: true,
      },
    });
  } catch (err) {
    console.error(`Guest evaluateAndSave failed for ${interviewId}:`, err);
    try {
      const { db } = await import('@/lib/db');
      await db.interview.update({
        where: { id: interviewId },
        data: { status: 'EVALUATION_FAILED' },
      });
    } catch {
      // DB not available, ignore
    }
  }
}