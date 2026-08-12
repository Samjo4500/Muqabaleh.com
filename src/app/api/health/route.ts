import { NextResponse } from 'next/server';

/** Lightweight public uptime probe (no DB). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'muqabaleh',
    ts: new Date().toISOString(),
  });
}
