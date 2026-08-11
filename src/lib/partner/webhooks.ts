import { createHmac } from 'crypto';
import { DEMO_PARTNER_ID, demoStore } from './demo-data';

export type PartnerWebhookEvent =
  | 'interview.completed'
  | 'candidate.scored'
  | 'job.published'
  | 'application.created';

function signPayload(secret: string, body: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Deliver an event to all active partner webhooks that subscribe to it.
 * Writes PartnerWebhookDelivery rows. Best-effort — never throws.
 */
export async function deliverPartnerWebhooks(opts: {
  partnerId: string;
  event: PartnerWebhookEvent;
  payload: Record<string, unknown>;
}): Promise<{ delivered: number; failed: number }> {
  let delivered = 0;
  let failed = 0;

  if (opts.partnerId === DEMO_PARTNER_ID) {
    const hooks = demoStore.webhooks.filter(
      (w) => w.isActive && w.events.includes(opts.event),
    );
    for (const hook of hooks) {
      hook.lastDeliveryAt = new Date().toISOString();
      delivered += 1;
    }
    return { delivered, failed };
  }

  try {
    const { db } = await import('@/lib/db');
    const hooks = await db.partnerWebhook.findMany({
      where: {
        partnerId: opts.partnerId,
        isActive: true,
      },
    });

    const envelope = {
      id: `evt_${Date.now().toString(36)}`,
      event: opts.event,
      createdAt: new Date().toISOString(),
      data: opts.payload,
    };
    const body = JSON.stringify(envelope);

    for (const hook of hooks) {
      if (!hook.events.includes(opts.event) && !hook.events.includes('*')) {
        continue;
      }
      const signature = signPayload(hook.secret, body);
      let statusCode: number | null = null;
      let success = false;
      let error: string | null = null;
      try {
        const res = await fetch(hook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Muqabaleh-PartnerWebhooks/1.0',
            'X-Muqabaleh-Event': opts.event,
            'X-Muqabaleh-Signature': `sha256=${signature}`,
          },
          body,
          signal: AbortSignal.timeout(8000),
        });
        statusCode = res.status;
        success = res.ok;
        if (!res.ok) error = `HTTP ${res.status}`;
      } catch (err) {
        error = err instanceof Error ? err.message : 'delivery failed';
        success = false;
      }

      try {
        await db.partnerWebhookDelivery.create({
          data: {
            partnerId: opts.partnerId,
            webhookId: hook.id,
            event: opts.event,
            payload: envelope as object,
            statusCode,
            success,
            error,
          },
        });
        await db.partnerWebhook.update({
          where: { id: hook.id },
          data: success
            ? { lastDeliveryAt: new Date(), failureCount: 0 }
            : { failureCount: { increment: 1 } },
        });
      } catch (persistErr) {
        console.error('[partner/webhooks] persist failed', persistErr);
      }

      if (success) delivered += 1;
      else failed += 1;
    }
  } catch (err) {
    console.error('[partner/webhooks] dispatch failed', err);
  }

  return { delivered, failed };
}

/** Resolve partnerId from a company, then fan out webhooks. */
export async function notifyPartnerForCompany(
  companyId: string | null | undefined,
  event: PartnerWebhookEvent,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!companyId) return;
  try {
    const { db } = await import('@/lib/db');
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { partnerId: true },
    });
    if (!company?.partnerId) return;
    await deliverPartnerWebhooks({
      partnerId: company.partnerId,
      event,
      payload: { ...payload, companyId },
    });
  } catch (err) {
    console.error('[partner/webhooks] company notify failed', err);
  }
}
