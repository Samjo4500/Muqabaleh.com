import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getClientIp } from '@/lib/security';

export type AdminAuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'REFUND' | 'VIEW' | 'LOGIN' | 'SECURITY';

/**
 * Immutable write to audit_logs. Never throws to callers.
 */
export async function writeAdminAudit(params: {
  adminId: string;
  action: AdminAuditAction | string;
  entity: string;
  entityId?: string | null;
  details?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    const ip = await getClientIp().catch(() => 'unknown');
    await db.adminAuditLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? undefined,
        details: params.details ?? {},
        ipAddress: ip,
      },
    });
  } catch (err) {
    console.error('[admin-audit] failed', err);
  }
}
