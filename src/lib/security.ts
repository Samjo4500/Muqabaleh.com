import { headers } from 'next/headers';
import { db } from './db';

// ─── Input Sanitization ─────────────────────────────────────────

/**
 * Strip HTML tags and trim whitespace.
 * NOT a full XSS sanitizer — use this for text fields going to DB.
 * For rich HTML, use DOMPurify on the client side.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim();
}

/** Sanitize an object's string fields recursively (max depth 3) */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  depth = 0,
): T {
  if (depth > 3 || !obj || typeof obj !== 'object') return obj;
  const out = { ...obj } as Record<string, unknown>;
  for (const key of Object.keys(out)) {
    const val = out[key];
    if (typeof val === 'string') {
      out[key] = sanitizeInput(val);
    } else if (Array.isArray(val)) {
      out[key] = val.map((v) =>
        typeof v === 'string' ? sanitizeInput(v) : v,
      );
    } else if (val && typeof val === 'object') {
      out[key] = sanitizeObject(
        val as Record<string, unknown>,
        depth + 1,
      );
    }
  }
  return out as T;
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate password strength: min 8 chars, has letter + number */
export function isStrongPassword(pw: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (pw.length < 8) errors.push('min_8_chars');
  if (!/[a-zA-Z]/.test(pw)) errors.push('needs_letter');
  if (!/[0-9]/.test(pw)) errors.push('needs_number');
  return { valid: errors.length === 0, errors };
}

/** Validate admin password: min 12 chars, letter + number + special */
export function isAdminPassword(pw: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (pw.length < 12) errors.push('min_12_chars');
  if (!/[a-zA-Z]/.test(pw)) errors.push('needs_letter');
  if (!/[0-9]/.test(pw)) errors.push('needs_number');
  if (!/[^a-zA-Z0-9]/.test(pw)) errors.push('needs_special_char');
  return { valid: errors.length === 0, errors };
}

// ─── Request Info Helpers ────────────────────────────────────────

/** Extract client IP from request headers */
export function getClientIp(): string {
  const h = headers();
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  );
}

/** Extract User-Agent from request headers */
export function getUserAgent(): string {
  return headers().get('user-agent') || 'unknown';
}

// ─── Audit Logging ──────────────────────────────────────────────

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'PASSWORD_CHANGE'
  | 'ACCOUNT_DELETE'
  | 'ROLE_CHANGE'
  | 'ADMIN_ACTION'
  | 'ACCESS_DENIED'
  | 'SESSION_EXPIRED'
  | 'REGISTER_SUCCESS'
  | 'REGISTER_FAILED';

interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Write to SecurityAuditLog. Fire-and-forget — never throws.
 * Uses the existing AuditLog Prisma model.
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.userId,
        event: entry.action,
        metadata: JSON.stringify({
          ip: entry.ipAddress,
          userAgent: entry.userAgent,
          success: entry.success,
          ...entry.metadata,
        }),
      },
    });
  } catch {
    // Never throw — audit logging is best-effort
  }
}

/**
 * Convenience: log a failed login attempt.
 */
export async function auditLoginFailed(
  email: string,
): Promise<void> {
  await auditLog({
    action: 'LOGIN_FAILED',
    ipAddress: getClientIp(),
    userAgent: getUserAgent(),
    success: false,
    metadata: { email },
  });
}

/**
 * Convenience: log a successful login.
 */
export async function auditLoginSuccess(
  userId: string,
  email: string,
): Promise<void> {
  await auditLog({
    userId,
    action: 'LOGIN_SUCCESS',
    ipAddress: getClientIp(),
    userAgent: getUserAgent(),
    success: true,
    metadata: { email },
  });
}

// ─── RBAC Constants ─────────────────────────────────────────────

export const ROLES = {
  USER: 'USER',
  INTERVIEWER: 'INTERVIEWER',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Route → allowed roles mapping */
export const ROUTE_ROLES: Record<string, Role[]> = {
  '/app': [ROLES.USER, ROLES.SUPER_ADMIN],
  '/interviewer': [ROLES.INTERVIEWER, ROLES.SUPER_ADMIN],
  '/b2b': [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  '/admin': [ROLES.SUPER_ADMIN],
};
