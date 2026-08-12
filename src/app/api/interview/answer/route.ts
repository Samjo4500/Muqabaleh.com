import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, enforceIpRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';
import { submitAnswer } from '@/lib/interview/session-service';

const schema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  userAnswer: z.string().min(1).max(12000),
  timeTakenSeconds: z.number().int().min(0).max(3600),
  startedAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const limited = await enforceIpRateLimit('/api/interview/*', 10);
  if (limited) return limited;

  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/interview/answer', 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Registration and email required', code: 'AUTH_REQUIRED' },
      { status: 401 },
    );
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const result = await submitAnswer({
      sessionId: body.sessionId,
      userId,
      questionId: body.questionId,
      userAnswer: body.userAnswer,
      timeTakenSeconds: body.timeTakenSeconds,
      startedAt: body.startedAt,
    });

    return NextResponse.json({
      feedback: {
        contentScore: result.feedback.contentScore,
        structureScore: result.feedback.structureScore,
        confidenceScore: result.feedback.confidenceScore,
        overallScore: result.feedback.overallScore,
        feedbackText: result.feedback.feedbackText,
        feedbackTextAr: result.feedback.feedbackTextAr,
        improvementTip: result.feedback.improvementTip,
        improvementTipAr: result.feedback.improvementTipAr,
        strengths: result.feedback.strengths,
        weaknesses: result.feedback.weaknesses,
      },
      nextAction: result.nextAction,
      nextQuestion: result.nextQuestion,
      followUpQuestion: result.followUpQuestion,
      responseId: result.responseId,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid answer payload' }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Failed to process answer';
    return NextResponse.json(
      { error: message },
      { status: message.includes('not found') ? 404 : 500 },
    );
  }
}
