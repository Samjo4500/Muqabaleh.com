import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, enforceIpRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';
import { generatePlanForPrequalId } from '@/lib/interview/plan-generator';
import { sanitizeCompanyMock } from '@/lib/interview/company-mock';

const schema = z.object({
  prequalId: z.string().min(1),
  companyMock: z
    .object({
      companyName: z.string().min(1).max(120),
      roleTitle: z.string().min(1).max(160),
      jobId: z.string().max(80).optional().nullable(),
      jobDescription: z.string().max(300).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export async function POST(req: NextRequest) {
  const limited = await enforceIpRateLimit('/api/interview/*', 10);
  if (limited) return limited;

  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/interview/plan', 20);
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
    const started = Date.now();
    const result = await generatePlanForPrequalId(
      body.prequalId,
      userId,
      sanitizeCompanyMock(body.companyMock),
    );
    return NextResponse.json({
      plan: result.plan,
      sessionId: result.sessionId,
      prequalId: result.prequalId,
      generatedInMs: Date.now() - started,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Failed to generate plan';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
