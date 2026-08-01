import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// POST /api/guest/interview — create a guest (demo) interview
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const language = body.language === 'en' ? 'EN' : 'AR';

    const guestToken = crypto.randomBytes(24).toString('hex');

    const interview = await db.interview.create({
      data: {
        mode: 'AI',
        type: 'BEHAVIORAL',
        industry: 'GENERAL',
        experience: 'MID',
        language,
        interviewerGender: 'MALE',
        guestToken,
        guestName: 'Demo Candidate',
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { token: guestToken, interviewId: interview.id },
      { status: 201 },
    );
  } catch (err) {
    console.error('POST /api/guest/interview error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ', en: 'Error' } },
      { status: 500 },
    );
  }
}
