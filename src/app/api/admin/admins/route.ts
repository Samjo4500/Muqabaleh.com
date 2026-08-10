import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

/**
 * POST create admin or reset password.
 * JWT sessions cannot be server-revoked without schema; reset password + deactivate/reactivate pattern:
 * deactivate clears access on next token refresh (isActive check).
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    action?: 'create' | 'reset_password' | 'revoke_sessions';
    email?: string;
    name?: string;
    role?: string;
    userId?: string;
  };

  if (body.action === 'create') {
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    const tempPassword = `Mq-${randomBytes(6).toString('hex')}!A1`;
    const { hash } = await import('bcryptjs');
    const passwordHash = await hash(tempPassword, 12);
    const role = body.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
    try {
      const user = await db.user.create({
        data: {
          email,
          name: String(body.name || 'Admin'),
          role,
          passwordHash,
          accountType: 'INDIVIDUAL',
          isActive: true,
        },
        select: { id: true, email: true, role: true },
      });
      if (auth.adminId) {
        await writeAdminAudit({
          adminId: auth.adminId,
          action: 'CREATE',
          entity: 'admins',
          entityId: user.id,
          details: { email, role },
        });
      }
      return NextResponse.json({ ok: true, user, tempPassword });
    } catch {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
  }

  const userId = String(body.userId || '').trim();
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!target || (target.role !== 'ADMIN' && target.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  // Prevent locking yourself out accidentally via revoke on self without password
  if (body.action === 'revoke_sessions' && auth.adminId === userId) {
    return NextResponse.json({ error: 'Cannot revoke your own session this way' }, { status: 400 });
  }

  if (body.action === 'reset_password') {
    const tempPassword = `Mq-${randomBytes(6).toString('hex')}!A1`;
    const { hash } = await import('bcryptjs');
    const passwordHash = await hash(tempPassword, 12);
    await db.user.update({ where: { id: userId }, data: { passwordHash } });
    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'SECURITY',
        entity: 'admins',
        entityId: userId,
        details: { action: 'reset_password' },
      });
    }
    return NextResponse.json({ ok: true, email: target.email, tempPassword });
  }

  if (body.action === 'revoke_sessions') {
    // JWT: mark inactive so next entitlement refresh rejects; rotate password hash.
    const tempPassword = `Mq-${randomBytes(6).toString('hex')}!A1`;
    const { hash } = await import('bcryptjs');
    const passwordHash = await hash(tempPassword, 12);
    await db.user.update({
      where: { id: userId },
      data: { isActive: false, passwordHash },
    });
    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'SECURITY',
        entity: 'admins',
        entityId: userId,
        details: { action: 'revoke_sessions', deactivated: true },
      });
    }
    return NextResponse.json({
      ok: true,
      deactivated: true,
      tempPassword,
      note: 'Account deactivated and password rotated. Reactivate from Users when ready.',
    });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
