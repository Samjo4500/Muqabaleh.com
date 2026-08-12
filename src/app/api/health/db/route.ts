import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { captureException } from '@/lib/sentry';

/**
 * Confirms database connectivity for ops / UptimeRobot.
 * Does not expose schema details or credentials.
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      db: 'up',
      ts: new Date().toISOString(),
    });
  } catch (err) {
    await captureException(err, { area: 'health.db' });
    return NextResponse.json(
      {
        ok: false,
        db: 'down',
        ts: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
