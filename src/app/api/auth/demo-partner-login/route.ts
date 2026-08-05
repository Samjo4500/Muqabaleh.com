import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { DEMO_ADMIN_USER_ID, DEMO_PARTNER_ID, demoStore } from '@/lib/partner/demo-data';

/** Issues a demo partner session cookie for console preview / sales demos. */
export async function POST() {
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
      tier: 'PREMIUM',
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
