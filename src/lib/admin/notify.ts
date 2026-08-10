import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

/** Best-effort admin inbox write (never throws). */
export async function writeAdminNotification(params: {
  channel?: string;
  recipient?: string;
  subject: string;
  body: string;
  status?: string;
  href?: string;
  kind?: string;
  severity?: 'info' | 'warn' | 'critical';
  meta?: Record<string, unknown>;
}) {
  try {
    await db.notificationLog.create({
      data: {
        channel: params.channel || 'EMAIL',
        recipient: params.recipient || process.env.ADMIN_EMAIL || 'admin',
        subject: params.subject,
        body: params.body,
        status: params.status || 'SENT',
        sentAt: new Date(),
        meta: {
          unread: true,
          href: params.href || '/admin/notifications',
          kind: params.kind || 'email',
          severity: params.severity || 'info',
          ...(params.meta || {}),
        } as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error('[admin-notify] failed', err);
  }
}
