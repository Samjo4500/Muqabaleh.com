import { NextResponse } from 'next/server';
import { getPublicInterviewConfig } from '@/lib/coach/config';
import { enforceIpRateLimit } from '@/lib/rate-limit';

export async function GET() {
  // Public catalog — do not share the tight /api/interview/* action bucket.
  const limited = await enforceIpRateLimit('/api/interview/coach/config', 60);
  if (limited) return limited;

  try {
    const payload = getPublicInterviewConfig();
    if (!payload.roles?.length) {
      return NextResponse.json(
        { error: 'Role catalog unavailable' },
        { status: 503 },
      );
    }
    return NextResponse.json(payload);
  } catch (err) {
    console.error('[api/coach/config]', err);
    return NextResponse.json(
      { error: 'Role catalog unavailable' },
      { status: 503 },
    );
  }
}
