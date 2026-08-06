import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiError, requireApiAuth } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** List verified interview certificates for the signed-in candidate. */
export async function GET() {
  try {
    const { userId } = await requireApiAuth();

    const interviews = await db.interview.findMany({
      where: {
        userId,
        verificationId: { not: null },
        status: 'COMPLETED',
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        verificationId: true,
        overallScore: true,
        industry: true,
        type: true,
        expiresAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      certificates: interviews.map((i) => ({
        interviewId: i.id,
        verificationId: i.verificationId!,
        score: i.overallScore,
        industry: i.industry,
        type: i.type,
        expiresAt: i.expiresAt,
        issuedAt: i.updatedAt,
      })),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[GET /api/candidate/certificates]', err);
    return NextResponse.json({ error: 'Failed to load certificates' }, { status: 500 });
  }
}
