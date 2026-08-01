import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const IS_DEMO = process.env.DEMO_MODE === 'true';

// In-memory demo state (survives for the lifetime of the serverless function invocation)
const demoInterviews = new Map<string, {
  id: string;
  language: string;
  status: string;
  messageCount: number;
}>();

// POST /api/guest/interview — create a guest (demo) interview
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const language = body.language === 'en' ? 'EN' : 'AR';
    const guestToken = crypto.randomBytes(24).toString('hex');

    // DEMO_MODE: create in-memory interview without database
    if (IS_DEMO) {
      const demoId = `demo-${crypto.randomUUID()}`;
      demoInterviews.set(guestToken, {
        id: demoId,
        language,
        status: 'PENDING',
        messageCount: 0,
      });
      return NextResponse.json(
        { token: guestToken, interviewId: demoId, demoMode: true },
        { status: 201 },
      );
    }

    // Production: use database
    const { db } = await import('@/lib/db');
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
      { token: guestToken, interviewId: interview.id, demoMode: false },
      { status: 201 },
    );
  } catch (err) {
    console.error('POST /api/guest/interview error:', err);

    // Graceful fallback: if DB is not configured, offer demo mode
    if (!process.env.DATABASE_URL) {
      const guestToken = crypto.randomBytes(24).toString('hex');
      const demoId = `demo-${crypto.randomUUID()}`;
      demoInterviews.set(guestToken, {
        id: demoId,
        language: 'AR',
        status: 'PENDING',
        messageCount: 0,
      });
      return NextResponse.json(
        { token: guestToken, interviewId: demoId, demoMode: true, fallback: true },
        { status: 201 },
      );
    }

    return NextResponse.json(
      { error: { ar: 'حدث خطأ', en: 'Error' } },
      { status: 500 },
    );
  }
}

// Export for use by messages route
export { demoInterviews };
