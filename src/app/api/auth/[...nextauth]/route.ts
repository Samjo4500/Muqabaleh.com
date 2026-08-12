import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enforceIpRateLimit } from '@/lib/rate-limit';

/**
 * On Vercel Preview, force NEXTAUTH_URL to the deployment host so
 * auth does not break when the shared env still points at production.
 */
if (
  process.env.VERCEL_ENV === 'preview' &&
  process.env.VERCEL_URL &&
  !process.env.NEXTAUTH_URL?.includes(process.env.VERCEL_URL)
) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

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
