import { NextRequest, NextResponse } from 'next/server';
import { enforceIpRateLimit } from '@/lib/rate-limit';
import { sendBrevoEmail, brandedEmailShell } from '@/lib/brevo';
import { MUQABALEH_BRAND } from '@/lib/brand/comms';

/** Help Center contact → support@muqabaleh.com via Brevo. */
export async function POST(req: NextRequest) {
  const limited = await enforceIpRateLimit('/api/support/contact', 5);
  if (limited) return limited;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    locale?: string;
  };

  if (!body.email?.trim() || !body.subject?.trim() || !body.message?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'email, subject, and message are required' },
      { status: 400 },
    );
  }

  const isAr = String(body.locale || '').startsWith('ar');
  const subject = `[Help] ${body.subject.trim()}`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2>Help Center — muqabaleh.com</h2>
      <p><strong>Name:</strong> ${escapeHtml(body.name || '—')}</p>
      <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(body.subject)}</p>
      <p><strong>Message:</strong><br/>${escapeHtml(body.message)}</p>
    </div>
  `;

  const toSupport = await sendBrevoEmail({
    to: MUQABALEH_BRAND.supportEmail || 'support@muqabaleh.com',
    subject,
    html,
    replyTo: { email: body.email.trim(), name: body.name?.trim() || undefined },
  });

  await sendBrevoEmail({
    to: body.email.trim(),
    subject: isAr ? 'استلمنا رسالتك — مقابلة' : 'We received your message — Muqabaleh',
    html: brandedEmailShell({
      locale: isAr ? 'ar' : 'en',
      eyebrow: isAr ? 'الدعم' : 'Support',
      title: isAr ? 'تم استلام رسالتك' : 'Message received',
      bodyHtml: isAr
        ? `<p style="margin:0;">شكراً لتواصلك. سنرد خلال ٢٤ ساعة عمل.</p>`
        : `<p style="margin:0;">Thanks for reaching out. We'll reply within 24 business hours.</p>`,
    }),
  });

  if (!toSupport.success) {
    return NextResponse.json({
      ok: true,
      warning: 'Logged locally',
    });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
