import { NextRequest, NextResponse } from 'next/server';
import { requireConfiguredSecret, secretsMatch } from '@/lib/security-tokens';

/** Fail-closed CRON_SECRET Bearer check (timing-safe). */
export function assertCronAuthorized(
  req: NextRequest,
): NextResponse | null {
  const expected = requireConfiguredSecret(process.env.CRON_SECRET, 16);
  if (!expected) {
    return NextResponse.json(
      { error: 'Service Unavailable — CRON_SECRET not configured' },
      { status: 503 },
    );
  }
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;
  if (!secretsMatch(token, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
