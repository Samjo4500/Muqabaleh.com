import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { finalizeReport, getSessionBundle } from '@/lib/interview/session-service';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
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

  const { sessionId } = await context.params;
  try {
    const bundle = await getSessionBundle(sessionId, userId);
    if (!bundle) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const report = await finalizeReport(sessionId, userId);

    // Partner white-label webhooks (best-effort)
    try {
      const { db } = await import('@/lib/db');
      const { deliverPartnerWebhooks } = await import('@/lib/partner/webhooks');
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { partnerId: true },
      });
      if (user?.partnerId) {
        const overall =
          typeof (report as { overallScore?: number })?.overallScore === 'number'
            ? (report as { overallScore: number }).overallScore
            : null;
        await deliverPartnerWebhooks({
          partnerId: user.partnerId,
          event: 'interview.completed',
          payload: { sessionId, userId, overallScore: overall, engine: 'bank' },
        });
        if (overall != null) {
          await deliverPartnerWebhooks({
            partnerId: user.partnerId,
            event: 'candidate.scored',
            payload: { sessionId, userId, overallScore: overall },
          });
        }
      }
    } catch (hookErr) {
      console.error('[interview/report] partner webhook failed', hookErr);
    }

    return NextResponse.json({
      sessionId,
      status: 'completed',
      report,
      jobsCta: { href: '/jobs', labelEn: 'Browse job listings', labelAr: 'تصفّح قائمة الوظائف' },
      registerCta: {
        href: '/auth/register',
        labelEn: 'Invite a friend to register',
        labelAr: 'ادعُ صديقاً للتسجيل',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load report';
    return NextResponse.json(
      { error: message },
      { status: message.includes('not found') ? 404 : 500 },
    );
  }
}
