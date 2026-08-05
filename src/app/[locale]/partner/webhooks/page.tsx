'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { PartnerWebhookRecord } from '@/lib/partner/types';
import { Field, PageHeader, Panel } from '@/components/partner/ui';

const EVENTS = [
  'interview.completed',
  'candidate.scored',
  'job.created',
  'invite.sent',
  'credits.low',
];

export default function PartnerWebhooksPage() {
  const t = useTranslations('partnerConsole');
  const [webhooks, setWebhooks] = useState<PartnerWebhookRecord[]>([]);
  const [url, setUrl] = useState('https://');
  const [events, setEvents] = useState<string[]>(['interview.completed', 'candidate.scored']);
  const [secret, setSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch('/api/partner/webhooks');
    const data = await res.json();
    setWebhooks(data.webhooks || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/partner/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, events }),
      });
      const data = await res.json();
      if (data.webhook?.secret) setSecret(data.webhook.secret);
      setUrl('https://');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/partner/webhooks?id=${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div>
      <PageHeader
        eyebrow={t('navWebhooks')}
        title={t('webhooksTitle')}
        description={t('webhooksDesc')}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Panel title={t('addWebhook')}>
          <form className="space-y-3" onSubmit={submit}>
            <Field label={t('fieldWebhookUrl')}>
              <input
                className="pc-input"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.yourbrand.com/hooks/muqabaleh"
              />
            </Field>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">
                {t('events')}
              </div>
              <div className="flex flex-wrap gap-2">
                {EVENTS.map((ev) => {
                  const on = events.includes(ev);
                  return (
                    <button
                      key={ev}
                      type="button"
                      onClick={() =>
                        setEvents((prev) =>
                          on ? prev.filter((x) => x !== ev) : [...prev, ev],
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        on
                          ? 'border-[var(--pc-primary)]/50 bg-[var(--pc-primary)]/15 text-white'
                          : 'border-white/10 text-white/50'
                      }`}
                    >
                      {ev}
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="submit" className="pc-btn pc-btn-primary" disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {t('saveWebhook')}
            </button>
            {secret ? (
              <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-xs text-amber-50">
                {t('webhookSecret')}: <span className="font-mono">{secret}</span>
              </div>
            ) : null}
          </form>
        </Panel>

        <Panel title={t('configuredWebhooks')}>
          <ul className="space-y-3">
            {webhooks.map((w) => (
              <li
                key={w.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{w.url}</div>
                    <div className="mt-1 text-xs text-white/45">{w.events.join(' · ')}</div>
                    <div className="mt-1 text-[11px] text-white/35">
                      {t('failures')}: {w.failureCount} · {w.secretHint}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="pc-btn pc-btn-ghost !px-3 !py-1.5 text-rose-200"
                    onClick={() => remove(w.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
