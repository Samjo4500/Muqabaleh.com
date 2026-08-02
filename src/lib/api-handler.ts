import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './rate-limit';
import { getClientIp } from './security';
import { ApiError } from './session';

export interface ApiHandlerConfig {
  /** Require authenticated session (default: true) */
  auth?: boolean;
  /** Rate limit: max requests per 15 min window (default: 100) */
  rateLimit?: number;
  /** Allow these roles (default: all authenticated users) */
  roles?: string[];
}

const DEFAULT_CONFIG: Required<ApiHandlerConfig> = {
  auth: true,
  rateLimit: 100,
  roles: [],
};

export type ApiHandlerFn = (
  req: NextRequest,
  context: { userId: string; role: string },
) => Promise<NextResponse> | NextResponse;

export type PublicApiHandlerFn = (
  req: NextRequest,
) => Promise<NextResponse> | NextResponse;

/**
 * Wrap an authenticated API route with:
 * - Rate limiting (per IP + route)
 * - Session validation
 * - Role checking
 * - Consistent error handling
 *
 * Usage:
 *   export const GET = withAuth((req, { userId }) => {
 *     return NextResponse.json({ ... });
 *   }, { roles: ['SUPER_ADMIN'] });
 */
export async function withAuth(
  handler: ApiHandlerFn,
  config?: ApiHandlerConfig,
) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return async (req: NextRequest): Promise<NextResponse> => {
    const ip = await getClientIp();
    const route = req.nextUrl.pathname;

    // Rate limit check
    const rl = checkRateLimit(ip, route, cfg.rateLimit);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: Math.ceil(rl.resetAt / 1000) },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rl.resetAt / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    // Auth check (via server session)
    if (cfg.auth) {
      try {
        const { getServerSession } = await import('next-auth');
        const { authOptions } = await import('./auth');
        const session = await getServerSession(authOptions);

        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as Record<string, unknown>;
        const role = (user.role as string) || 'USER';

        // Role check
        if (cfg.roles.length > 0 && !cfg.roles.includes(role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return handler(req, {
          userId: user.id as string,
          role,
        });
      } catch (e) {
        if (e instanceof ApiError) {
          return NextResponse.json(
            { error: e.message },
            { status: e.status },
          );
        }
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 },
        );
      }
    }

    // Public route (auth not required)
    return handler(req as any, { userId: '', role: '' });
  };
}

/**
 * Wrap a PUBLIC API route with rate limiting only.
 */
export async function withRateLimit(
  handler: PublicApiHandlerFn,
  limit = 100,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const ip = await getClientIp();
    const route = req.nextUrl.pathname;
    const rl = checkRateLimit(ip, route, limit);

    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: Math.ceil(rl.resetAt / 1000) },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rl.resetAt / 1000)),
          },
        },
      );
    }

    return handler(req);
  };
}
