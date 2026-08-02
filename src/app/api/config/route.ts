import { NextResponse } from 'next/server';

// GET /api/config — public endpoint, only exposes demo mode flag
// All internal service flags are removed for security.
export async function GET() {
  const isDemoMode = process.env.DEMO_MODE === 'true';

  return NextResponse.json({
    demoMode: isDemoMode,
  });
}
