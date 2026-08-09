import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { SignJWT } from 'jose';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';
import { sendBrevoEmail, brandedEmailShell } from '@/lib/brevo';

function appUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    'https://muqabaleh.com'
  );
}

function secretKey() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/auth/forgot-password', 8);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      locale?: string;
    };
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const locale = body.locale === 'ar' ? 'ar' : 'en';

    // Always return ok to avoid email enumeration
    const okResponse = NextResponse.json({
      ok: true,
      message:
        locale === 'ar'
          ? 'إذا كان البريد مسجلاً، ستصلك رسالة خلال دقائق.'
          : 'If that email is registered, a reset link will arrive shortly.',
    });

    if (!email || !email.includes('@')) return okResponse;

    const key = secretKey();
    if (!key) {
      console.error('[forgot-password] NEXTAUTH_SECRET missing');
      return okResponse;
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return okResponse;

    const jti = randomBytes(16).toString('hex');
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      typ: 'password_reset',
      jti,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key);

    const tokenHash = createHash('sha256').update(token).digest('hex');
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const link =
      locale === 'ar'
        ? `${appUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`
        : `${appUrl()}/en/auth/reset-password?token=${encodeURIComponent(token)}`;

    const isAr = locale === 'ar';
    const subject = isAr
      ? 'إعادة تعيين كلمة المرور'
      : 'Reset your Muqabaleh password';
    const title = isAr
      ? `${user.name || 'مرحباً'}، أعد تعيين كلمة المرور`
      : `${user.name || 'Hello'}, reset your password`;
    const html = brandedEmailShell({
      locale,
      title,
      bodyHtml: isAr
        ? `<p>استلمنا طلباً لإعادة تعيين كلمة المرور لحسابك على Muqabaleh. الرابط صالح لمدة ساعة واحدة.</p>`
        : `<p>We received a request to reset your Muqabaleh password. This link expires in 1 hour.</p>`,
      ctaHref: link,
      ctaLabel: isAr ? 'إعادة تعيين كلمة المرور' : 'Reset password',
    });

    await sendBrevoEmail({
      to: user.email,
      subject,
      html,
      sender: { name: 'Muqabaleh', email: 'noreply@muqabaleh.com' },
    });

    return okResponse;
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ ok: true });
  }
}
