import { NextResponse } from 'next/server';
import { getPublicInterviewConfig } from '@/lib/coach/config';

export async function GET() {
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
