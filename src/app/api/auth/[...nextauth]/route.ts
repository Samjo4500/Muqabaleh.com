import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enforceIpRateLimit } from '@/lib/rate-limit';
import { applyRuntimeEnvDefaults } from '@/lib/env/runtime';

/** Fill empty NEXTAUTH_URL / Brevo aliases; pin Preview to deployment host. */
applyRuntimeEnvDefaults();

const handler = NextAuth(authOptions);

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth: string[] }> },
) {
  return handler(req, ctx);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth: string[] }> },
) {
  // Login / CSRF / credentials posts share this handler — limit abuse.
  const limited = await enforceIpRateLimit('/api/auth/*', 5);
  if (limited) return limited;
  return handler(req, ctx);
}
