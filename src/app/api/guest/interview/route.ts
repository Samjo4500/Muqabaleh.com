import { NextResponse } from 'next/server';

/**
 * Ungated free guest interviews are disabled.
 * Users must register (email captured) and complete /interview/prequal first.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Free interviews require registration and pre-qualifying questions. Use /auth/register then /interview/prequal.',
      code: 'PREQUAL_AND_REGISTRATION_REQUIRED',
      redirectTo: '/interview/prequal',
      registerTo: '/auth/register',
    },
    { status: 403 },
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Guest interview creation is disabled. Register and complete pre-qual first.',
      code: 'PREQUAL_AND_REGISTRATION_REQUIRED',
    },
    { status: 403 },
  );
}
