import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp, sanitizeObject } from '@/lib/security';
import {
  attributionFromBody,
  captureMarketingContact,
} from '@/lib/marketing/contact';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120).optional(),
  phone: z.string().max(40).optional(),
  country: z.string().max(80).optional(),
  locale: z.string().max(10).optional(),
  marketingOptIn: z.boolean().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  landingPath: z.string().optional(),
  referrer: z.string().optional(),
});

// POST /api/newsletter — persist email + optional PII for marketing
export async function POST(req: NextRequest) {
  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/newsletter', 20);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  }

  try {
    const body = sanitizeObject(await req.json());
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const data = parsed.data;
    const result = await captureMarketingContact({
      email: data.email,
      name: data.name,
      phone: data.phone,
      country: data.country,
      locale: data.locale,
      source: 'NEWSLETTER',
      marketingOptIn: data.marketingOptIn !== false,
      ...attributionFromBody(body as Record<string, unknown>),
      meta: { ip },
    });

    if (!result.ok) {
      return NextResponse.json({ error: 'Could not subscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
