import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

// POST /api/email/send — low-level email send endpoint
export async function POST(req: NextRequest) {
  try {
    // Simple auth: require an internal secret header to prevent abuse
    const secret = req.headers.get('x-email-secret');
    if (secret !== process.env.EMAIL_INTERNAL_SECRET) {
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
