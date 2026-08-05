import { NextRequest, NextResponse } from 'next/server';
import { resolvePartnerByHost } from '@/lib/partner/service';
import { demoStore } from '@/lib/partner/demo-data';

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get('host') || req.headers.get('x-partner-host') || '';
  const slug = req.nextUrl.searchParams.get('slug');
  if (slug && slug === demoStore.partner.slug) {
    return NextResponse.json({ partner: demoStore.partner });
  }
  if (!host) return NextResponse.json({ partner: null });
  const partner = await resolvePartnerByHost(host);
  return NextResponse.json({ partner });
}
