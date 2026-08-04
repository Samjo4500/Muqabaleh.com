import { NextRequest, NextResponse } from 'next/server';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;
  if (!auth.adminId) return NextResponse.json({ error: 'No admin id' }, { status: 400 });

  const user = await db.user.findUnique({
    where: { id: auth.adminId },
    select: { totpEnabled: true },
  });
  return NextResponse.json({ enabled: Boolean(user?.totpEnabled) });
}

export async function POST() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;
  if (!auth.adminId) return NextResponse.json({ error: 'No admin id' }, { status: 400 });

  const secret = generateSecret();
  await db.user.update({
    where: { id: auth.adminId },
    data: { totpSecret: secret, totpEnabled: false },
  });

  const otpauth = generateURI({
    issuer: 'Muqabaleh Admin',
    label: auth.adminEmail,
    secret,
  });
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  await writeAdminAudit({
    adminId: auth.adminId,
    action: 'SECURITY',
    entity: '2fa',
    details: { step: 'secret_generated' },
  });

  return NextResponse.json({ secret, qrDataUrl });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;
  if (!auth.adminId) return NextResponse.json({ error: 'No admin id' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const token = String(body.token || '').trim();
  const user = await db.user.findUnique({ where: { id: auth.adminId } });
  if (!user?.totpSecret) {
    return NextResponse.json({ error: 'No secret enrolled' }, { status: 400 });
  }

  const valid = Boolean(verifySync({ token, secret: user.totpSecret }).valid);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  await db.user.update({
    where: { id: auth.adminId },
    data: { totpEnabled: true },
  });

  await writeAdminAudit({
    adminId: auth.adminId,
    action: 'SECURITY',
    entity: '2fa',
    details: { step: 'enabled' },
  });

  return NextResponse.json({ ok: true, enabled: true });
}
