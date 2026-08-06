import { NextResponse } from 'next/server';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { getJeannieTracker } from '@/lib/jeannie/tracker';

export async function GET() {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const tracker = await getJeannieTracker(user.id);
  if (!tracker) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(tracker);
}
