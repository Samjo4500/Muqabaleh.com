import { NextRequest, NextResponse } from 'next/server';
import { sendBrevoEmail } from '@/lib/brevo';

/**
 * Enterprise contact form → sales@muqabaleh.com via Brevo.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    teamSize?: string;
    message?: string;
    locale?: string;
  };

  if (!body.name?.trim() || !body.email?.trim() || !body.company?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'name, company, and email are required' },
      { status: 400 },
    );
  }

  const subject = `[Muqabaleh Enterprise] ${body.company} — ${body.name}`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2>Enterprise inquiry — muqabaleh.com</h2>
      <p><strong>Name:</strong> ${escapeHtml(body.name)}</p>
      <p><strong>Company:</strong> ${escapeHtml(body.company)}</p>
      <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(body.phone || '—')}</p>
      <p><strong>Team size:</strong> ${escapeHtml(body.teamSize || '—')}</p>
      <p><strong>Message:</strong><br/>${escapeHtml(body.message || '—')}</p>
      <p style="color:#64748b;font-size:12px">Locale: ${escapeHtml(body.locale || 'ar')}</p>
    </div>
  `;

  try {
    const result = await sendBrevoEmail({
      to: 'sales@muqabaleh.com',
      subject,
      html,
      replyTo: { email: body.email.trim(), name: body.name.trim() },
    });

    if (!result.success) {
      console.error('[employers/contact] Brevo failed', result.error);
      return NextResponse.json({
        ok: true,
        queued: false,
        warning: 'Email provider unavailable — inquiry logged',
      });
    }

    return NextResponse.json({ ok: true, queued: true });
  } catch (err) {
    console.error('[employers/contact]', err);
    return NextResponse.json({ ok: true, queued: false, warning: 'Logged locally' });
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
