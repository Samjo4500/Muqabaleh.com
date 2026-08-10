import { NextRequest, NextResponse } from 'next/server';
import { submitPartnerApplication } from '@/lib/partner/service';
import {
  attributionFromBody,
  captureMarketingContact,
} from '@/lib/marketing/contact';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const companyName = String(body.companyName || '').trim();
    const contactName = String(body.contactName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    if (!companyName || !contactName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const result = await submitPartnerApplication({
      companyName,
      contactName,
      email,
      phone: body.phone ? String(body.phone) : undefined,
      website: body.website ? String(body.website) : undefined,
      country: body.country ? String(body.country) : undefined,
      message: body.message ? String(body.message) : undefined,
    });
    void captureMarketingContact({
      email,
      name: contactName,
      phone: body.phone ? String(body.phone) : null,
      country: body.country ? String(body.country) : null,
      source: 'PARTNER',
      marketingOptIn: true,
      ...attributionFromBody(body as Record<string, unknown>),
      meta: { companyName, website: body.website || null },
    }).catch(() => {});
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('partner apply', err);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
