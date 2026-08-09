import { NextRequest, NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { DEMO_ADMIN_USER_ID, DEMO_PARTNER_ID, demoStore } from '@/lib/partner/demo-data';
import { requireConfiguredSecret, secretsMatch } from '@/lib/security-tokens';

/**
 * Issues a demo partner session cookie for console preview / sales demos.
 * Disabled unless DEMO_PARTNER_LOGIN_SECRET is set (fail closed in production).
 */
export async function POST(req: NextRequest) {
  const expected = requireConfiguredSecret(
    process.env.DEMO_PARTNER_LOGIN_SECRET,
    24,
  );
  if (!expected) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const provided =
    req.headers.get('x-demo-partner-secret') ||
    (await req.json().catch(() => ({} as { secret?: string }))).secret ||
    '';

  if (!secretsMatch(String(provided), expected)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  const token = await encode({
    token: {
      id: DEMO_ADMIN_USER_ID,
      sub: DEMO_ADMIN_USER_ID,
      email: demoStore.partner.contactEmail,
      name: demoStore.partner.contactName,
      role: 'PARTNER_ADMIN',
      accountType: 'PARTNER',
      partnerId: DEMO_PARTNER_ID,
      companyId: undefined,
      sessionsLeft: 0,
      language: 'en',
      tier: 'JEANNIE_PRO',
    },
    secret,
    maxAge: 24 * 60 * 60,
  });

  const res = NextResponse.json({
    ok: true,
    redirectTo: '/partner',
    partner: { name: demoStore.partner.name, slug: demoStore.partner.slug },
  });

  const secure = process.env.NODE_ENV === 'production';
  const cookieName = secure
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  res.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    maxAge: 24 * 60 * 60,
  });

  return res;
}
