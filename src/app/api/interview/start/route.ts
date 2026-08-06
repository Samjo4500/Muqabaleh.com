import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';
import { startSession } from '@/lib/interview/session-service';

const schema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/interview/start', 20);
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
    const { sessionId } = schema.parse(await req.json());
    const result = await startSession(sessionId, userId);
    return NextResponse.json({
      sessionId,
      status: 'active',
      firstQuestion: result.firstQuestion,
      numQuestionsTotal: result.plan.numQuestions,
      language: result.plan.language,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Failed to start session';
    const status =
      typeof (err as { status?: number })?.status === 'number'
        ? (err as { status: number }).status
        : message.includes('not found')
          ? 404
          : message.includes('practice') || message.includes('sessions left')
            ? 402
            : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
