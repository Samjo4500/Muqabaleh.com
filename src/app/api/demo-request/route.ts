import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput } from '@/lib/security';
import {
  attributionFromBody,
  captureMarketingContact,
} from '@/lib/marketing/contact';

export const dynamic = 'force-dynamic';

/**
 * Public lead capture for business console demos.
 * Stored as a SupportTicket (category DEMO_REQUEST) for admin follow-up.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = sanitizeInput(body.name);
    const email = sanitizeInput(body.email).toLowerCase();
    const company = sanitizeInput(body.company);
    const phone = sanitizeInput(body.phone || '');
    const teamSize = sanitizeInput(body.teamSize || '');
    const message = sanitizeInput(body.message || '');
    const source = sanitizeInput(body.source || 'request-demo');

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!company || company.length < 2) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const subject = `Demo request — ${company}`;
    const bodyText = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company}`,
      phone ? `Phone: ${phone}` : null,
      teamSize ? `Team size: ${teamSize}` : null,
      `Source: ${source}`,
      '',
      message || '(no message)',
    ]
      .filter(Boolean)
      .join('\n');

    const ticket = await db.supportTicket.create({
      data: {
        subject,
        body: bodyText,
        status: 'OPEN',
        priority: 'HIGH',
        category: 'DEMO_REQUEST',
      },
    });

    void captureMarketingContact({
      email,
      name,
      phone: phone || null,
      source: 'DEMO',
      marketingOptIn: true,
      ...attributionFromBody(body as Record<string, unknown>),
      meta: { company, teamSize, ticketId: ticket.id, leadSource: source },
    }).catch(() => {});

    return NextResponse.json({ ok: true, id: ticket.id });
  } catch (err) {
    console.error('[POST /api/demo-request]', err);
    return NextResponse.json({ error: 'Could not submit request' }, { status: 500 });
  }
}
