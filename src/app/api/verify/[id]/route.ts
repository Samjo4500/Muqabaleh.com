import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/verify/[id] — verify a certificate
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const interview = await db.interview.findFirst({
      where: { verificationId: id },
      include: { user: { select: { name: true } } },
    });

    if (!interview) {
      return NextResponse.json({ valid: false, reason: 'not_found' });
    }

    const isExpired = interview.expiresAt && interview.expiresAt < new Date();

    if (isExpired) {
      return NextResponse.json({
        valid: false,
        reason: 'expired',
        name: interview.guestName || interview.user?.name,
        score: interview.overallScore,
        issuedAt: interview.updatedAt,
        expiresAt: interview.expiresAt,
      });
    }

    return NextResponse.json({
      valid: true,
      name: interview.guestName || interview.user?.name,
      score: interview.overallScore,
      level: interview.overallScore && interview.overallScore >= 85 ? 'excellent' : interview.overallScore && interview.overallScore >= 70 ? 'good' : 'passing',
      issuedAt: interview.updatedAt,
      expiresAt: interview.expiresAt,
      industry: interview.industry,
      type: interview.type,
    });
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ', en: 'Error' } }, { status: 500 });
  }
}
