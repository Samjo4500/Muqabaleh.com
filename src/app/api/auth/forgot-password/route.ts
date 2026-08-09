import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { SignJWT } from 'jose';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';
import { sendBrevoEmail, brandedEmailShell } from '@/lib/brevo';
import { MUQABALEH_BRAND } from '@/lib/brand/comms';

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
    const name = user.name || (isAr ? 'مرحباً' : 'Hello');
    const subject = isAr
      ? 'إعادة تعيين كلمة المرور — مقابلة'
      : 'Reset your Muqabaleh password';
    const html = brandedEmailShell({
      locale,
      eyebrow: isAr ? 'أمان الحساب' : 'Account security',
      title: isAr
        ? `${name}، أعد تعيين كلمة المرور`
        : `${name}, reset your password`,
      bodyHtml: isAr
        ? `<p style="margin:0 0 12px;">استلمنا طلباً لإعادة تعيين كلمة المرور لحسابك على مقابلة.</p>
           <p style="margin:0;color:#64748b;font-size:14px;">الرابط صالح لمدة ساعة واحدة. إذا لم تطلب هذا، تجاهل الرسالة — لن تتغير كلمة مرورك.</p>`
        : `<p style="margin:0 0 12px;">We received a request to reset your Muqabaleh password.</p>
           <p style="margin:0;color:#64748b;font-size:14px;">This link expires in 1 hour. If you didn't ask for this, ignore the email — your password stays the same.</p>`,
      ctaHref: link,
      ctaLabel: isAr ? 'إعادة تعيين كلمة المرور' : 'Reset password',
      footnote: isAr
        ? 'لأمانك لا نشارك هذا الرابط مع أي جهة أخرى.'
        : 'For your security, we never share this link with anyone else.',
    });

    const brevo = await sendBrevoEmail({
      to: user.email,
      subject,
      html,
      sender: MUQABALEH_BRAND.senders.system,
    });
    if (!brevo.success) {
      // Fall back to Resend path used by other transactional mail
      const { triggerPasswordResetEmail } = await import('@/lib/email-triggers');
      await triggerPasswordResetEmail(
        user.email,
        user.name || (isAr ? 'مرحباً' : 'Hello'),
        link,
        locale,
      );
    }

    return okResponse;
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ ok: true });
  }
}
