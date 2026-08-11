'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ConsoleApiKey, ConsoleWebhook } from '@/lib/console/types';

export default function DevelopersPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const [apiKeys, setApiKeys] = useState<ConsoleApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<ConsoleWebhook[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [url, setUrl] = useState('https://hooks.example.com/muqabaleh');

  const reload = async () => {
    const res = await fetch(`/api/console/${tenantSlug}/developers`);
    const json = await res.json();
    setApiKeys(json.apiKeys || []);
    setWebhooks(json.webhooks || []);
    setEvents(json.events || []);
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  const createKey = async () => {
    const res = await fetch(`/api/console/${tenantSlug}/developers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_key', name: 'New key' }),
    });
    const json = await res.json();
    if (json.raw) setRawKey(json.raw);
    await reload();
  };

  const revoke = async (keyId: string) => {
    await fetch(`/api/console/${tenantSlug}/developers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revoke_key', keyId }),
    });
    await reload();
  };

  const addWebhook = async () => {
    await fetch(`/api/console/${tenantSlug}/developers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_webhook',
        url,
        events: ['passport.received', 'candidate.shortlisted', 'interview.completed'],
      }),
    });
    await reload();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[var(--c-text)]">{t('developersTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('developersHint')}</p>
      </div>

      <section className="mq-console-surface rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--c-text)]">{t('apiKeys')}</h3>
          <button type="button" className="mq-console-btn-primary" onClick={() => void createKey()}>
            {t('generateKey')}
          </button>
        </div>
        {rawKey ? (
          <p className="mb-3 rounded-lg border border-[var(--c-primary)] bg-[var(--c-primary-soft)] p-3 font-mono text-xs text-[var(--c-text)]">
            {t('copyKeyOnce')}: {rawKey}
          </p>
        ) : null}
        <div className="space-y-2">
          {apiKeys.map((k) => (
            <div key={k.id} className="mq-console-card flex items-center justify-between gap-3 p-3">
              <div>
                <p className="font-semibold text-[var(--c-text)]">{k.name}</p>
                <p className="font-mono text-xs text-[var(--c-text-2)]">{k.prefix}_••••</p>
              </div>
              <button
                type="button"
                className="text-xs text-[#EF4444]"
                onClick={() => void revoke(k.id)}
              >
                {t('revoke')}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mq-console-surface rounded-xl p-4">
        <h3 className="mb-3 text-sm font-bold text-[var(--c-text)]">{t('webhooks')}</h3>
        <p className="mb-3 text-xs text-[var(--c-text-2)]">
          {t('webhookEvents')}: {events.join(', ')}
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          <input
            className="mq-console-input min-w-[240px] flex-1"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="button" className="mq-console-btn-ghost" onClick={() => void addWebhook()}>
            {t('addWebhook')}
          </button>
        </div>
        <div className="space-y-2">
          {webhooks.map((w) => (
            <div key={w.id} className="mq-console-card p-3 text-sm">
              <p className="break-all font-semibold text-[var(--c-text)]">{w.url}</p>
              <p className="mt-1 text-xs text-[var(--c-text-2)]">{w.events.join(' · ')}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
