'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, KeyRound, Loader2, Trash2 } from 'lucide-react';
import type { PartnerApiKeySafe } from '@/lib/partner/types';
import { Field, PageHeader, Panel } from '@/components/partner/ui';

export default function PartnerApiKeysPage() {
  const t = useTranslations('partnerConsole');
  const [keys, setKeys] = useState<PartnerApiKeySafe[]>([]);
  const [name, setName] = useState('Production');
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch('/api/partner/api-keys');
    const data = await res.json();
    setKeys(data.keys || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/partner/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, scopes: ['read', 'write', 'webhooks'] }),
      });
      const data = await res.json();
      if (data.key?.plaintext) setCreated(data.key.plaintext);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id: string) => {
    await fetch(`/api/partner/api-keys?id=${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div>
      <PageHeader
        eyebrow={t('navApiKeys')}
        title={t('apiKeysTitle')}
        description={t('apiKeysDesc')}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Panel title={t('createKey')}>
          <Field label={t('fieldKeyName')}>
            <input className="pc-input" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <button type="button" className="pc-btn pc-btn-primary mt-4" onClick={create} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            {t('generateKey')}
          </button>
          {created ? (
            <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-sm">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-100">
                {t('copyOnce')}
              </div>
              <div className="flex items-center gap-2 break-all font-mono text-amber-50">
                {created}
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-white/15 p-1.5"
                  onClick={() => navigator.clipboard.writeText(created)}
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel title={t('existingKeys')}>
          <ul className="space-y-3">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{k.name}</div>
                  <div className="text-xs text-white/45">
                    {k.keyHint} · {k.scopes.join(', ')}
                    {k.revokedAt ? ` · ${t('revoked')}` : ''}
                  </div>
                </div>
                {!k.revokedAt ? (
                  <button
                    type="button"
                    className="pc-btn pc-btn-ghost !px-3 !py-1.5 text-rose-200"
                    onClick={() => revoke(k.id)}
                  >
                    <Trash2 size={14} />
                    {t('revoke')}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
