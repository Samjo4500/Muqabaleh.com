import { processEmailQueue } from '@/lib/email';
import { processNurtureQueue } from '@/lib/nurture/process';

export type EmailCronResult = {
  processed: boolean;
  sent: number;
  failed: number;
  nurture: { sent: number; skipped: number; failed: number };
  errors: string[];
};

/** Public JSON must never include stacks or connection strings. */
export function cronErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return raw.replace(/\s+/g, ' ').trim().slice(0, 200);
}

/**
 * Email queue and nurture must not take each other down. GitHub Actions
 * previously hid the Prisma body behind curl -f + HTTP 500.
 */
export async function runEmailCron(
  deps: {
    processEmailQueue: typeof processEmailQueue;
    processNurtureQueue: typeof processNurtureQueue;
  } = { processEmailQueue, processNurtureQueue },
): Promise<EmailCronResult> {
  const errors: string[] = [];
  let sent = 0;
  let failed = 0;
  let nurture = { sent: 0, skipped: 0, failed: 0 };

  try {
    const queue = await deps.processEmailQueue();
    sent = queue.sent;
    failed = queue.failed;
  } catch (err) {
    console.error('email queue cron failed:', err);
    errors.push(`emailQueue: ${cronErrorMessage(err)}`);
  }

  try {
    nurture = await deps.processNurtureQueue();
  } catch (err) {
    console.error('nurture queue cron failed:', err);
    errors.push(`nurture: ${cronErrorMessage(err)}`);
  }

  return {
    processed: true,
    sent,
    failed,
    nurture,
    errors,
  };
}
