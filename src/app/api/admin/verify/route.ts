import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp, auditLog, isAdminPassword } from '@/lib/security';

export async function POST(request: NextRequest) {
  const ip = getClientIp();

  // Strict rate limit: 5 attempts per 15 min per IP
  const rl = checkRateLimit(ip, '/api/admin/verify', 5);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts' },
      { status: 429 },
    );
  }

  try {
    const { password } = await request.json();

    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Password required' },
        { status: 400 },
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    // CRITICAL: No fallback password. If ADMIN_PASSWORD is not set, admin is disabled.
    if (!adminPassword) {
      await auditLog({
        action: 'ACCESS_DENIED',
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        metadata: { reason: 'ADMIN_PASSWORD not configured' },
      });
      return NextResponse.json(
        { success: false, error: 'Admin access is not configured' },
        { status: 403 },
      );
    }

    if (password === adminPassword) {
      await auditLog({
        action: 'LOGIN_SUCCESS',
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: true,
        metadata: { type: 'admin' },
      });
      return NextResponse.json({ success: true });
    }

    await auditLog({
      action: 'LOGIN_FAILED',
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: false,
      metadata: { type: 'admin' },
    });
    return NextResponse.json({ success: false }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
