import { NextResponse } from 'next/server';
import { getPublicInterviewConfig } from '@/lib/coach/config';
import { enforceIpRateLimit } from '@/lib/rate-limit';

export async function GET() {
  const limited = await enforceIpRateLimit('/api/interview/*', 10);
  if (limited) return limited;

  try {
    return NextResponse.json(getPublicInterviewConfig());
  } catch (err) {
    console.error('[api/coach/config]', err);
    return NextResponse.json(
      {
        roles: [],
        industries: [],
        seniority: [],
        languages: [],
        storageKey: 'mq_coach_prep',
      },
      { status: 200 },
    );
  }
}
