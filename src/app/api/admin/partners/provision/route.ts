import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/api/admin/_lib';
import { provisionPartnerFromApplication } from '@/lib/partner/service';

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin.authorized) return admin.response;
  const body = await req.json();
  const applicationId = String(body.applicationId || '').trim();
  if (!applicationId) {
    return NextResponse.json({ error: 'applicationId required' }, { status: 400 });
  }
  const result = await provisionPartnerFromApplication(applicationId);
  return NextResponse.json({ ok: true, ...result });
}
