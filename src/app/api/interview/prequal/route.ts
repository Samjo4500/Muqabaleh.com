import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, enforceIpRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';
import { db } from '@/lib/db';
import { savePrequal } from '@/lib/interview/plan-generator';
import {
  DURATION_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  ROLE_OPTIONS,
  ROUND_OPTIONS,
  SENIORITY_OPTIONS,
  LANGUAGE_OPTIONS,
} from '@/lib/interview/constants';

const schema = z.object({
  sessionId: z.string().uuid().optional(),
  targetRole: z.enum(ROLE_OPTIONS.map((r) => r.value) as [string, ...string[]]),
  seniorityLevel: z.enum(SENIORITY_OPTIONS.map((r) => r.value) as [string, ...string[]]),
  questionTypes: z
    .array(z.enum(QUESTION_TYPE_OPTIONS.map((r) => r.value) as [string, ...string[]]))
    .min(1)
    .max(3),
  interviewRound: z.enum(ROUND_OPTIONS.map((r) => r.value) as [string, ...string[]]),
  languagePreference: z.enum(LANGUAGE_OPTIONS.map((r) => r.value) as [string, ...string[]]),
  targetIndustry: z.string().optional().nullable(),
  weaknessFocus: z.string().optional().nullable(),
  durationPreset: z.enum(DURATION_OPTIONS.map((r) => r.value) as [string, ...string[]]),
});

export async function POST(req: NextRequest) {
  const limited = await enforceIpRateLimit('/api/interview/*', 10);
  if (limited) return limited;

  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/interview/prequal', 30);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Registration required', code: 'AUTH_REQUIRED' },
      { status: 401 },
    );
  }

  const userId = (session.user as { id?: string }).id;
  const email = session.user.email;
  if (!userId || !email) {
    return NextResponse.json(
      { error: 'Email registration required before starting an interview', code: 'EMAIL_REQUIRED' },
      { status: 403 },
    );
  }

  try {
    // Ensure email is persisted on user record
    await db.user
      .update({ where: { id: userId }, data: { email } })
      .catch(() => undefined);

    const body = schema.parse(await req.json());
    const saved = await savePrequal({
      userId,
      userEmail: email,
      sessionId: body.sessionId,
      targetRole: body.targetRole,
      seniorityLevel: body.seniorityLevel,
      questionTypes: body.questionTypes,
      interviewRound: body.interviewRound,
      languagePreference: body.languagePreference,
      targetIndustry: body.targetIndustry,
      weaknessFocus: body.weaknessFocus,
      durationPreset: body.durationPreset,
    });

    return NextResponse.json({
      prequalId: saved.prequalId,
      sessionId: saved.sessionId,
      numQuestions: saved.numQuestions,
      estimatedDurationMin: saved.estimatedDurationMin,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid pre-qual data', details: err.flatten() },
        { status: 400 },
      );
    }
    console.error('POST /api/interview/prequal', err);
    return NextResponse.json({ error: 'Failed to save pre-qual' }, { status: 500 });
  }
}
