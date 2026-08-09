import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { requireConfiguredSecret, secretsMatch } from '@/lib/security-tokens';

// POST /api/email/send — internal-only email send endpoint (fail closed)
export async function POST(req: NextRequest) {
  try {
    const expected = requireConfiguredSecret(
      process.env.EMAIL_INTERNAL_SECRET,
      24,
    );
    if (!expected) {
      return NextResponse.json(
        { error: 'Email relay not configured' },
        { status: 503 },
      );
    }

    const provided = req.headers.get('x-email-secret');
    if (!secretsMatch(provided, expected)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { to, subject, html, from, replyTo } = body as {
      to: string | string[];
      subject: string;
      html: string;
      from?: string;
      replyTo?: string;
    };

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'to, subject, and html are required' },
        { status: 400 },
      );
    }

    const result = await sendEmail({ to, subject, html, from, replyTo });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('POST /api/email/send error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
