'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ConsoleOrganization, WhiteLabelConfig } from '@/lib/console/types';

export default function SettingsPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const [org, setOrg] = useState<ConsoleOrganization | null>(null);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [wl, setWl] = useState<WhiteLabelConfig>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/console/${tenantSlug}/settings`)
      .then((r) => r.json())
      .then((j) => {
        const o = j.organization as ConsoleOrganization | undefined;
        if (!o) return;
        setOrg(o);
        setName(o.name);
        setIndustry(o.industry || '');
        setWl(o.whiteLabel || {});
      });
  }, [tenantSlug]);

  const save = async () => {
    const res = await fetch(`/api/console/${tenantSlug}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, industry, whiteLabel: wl }),
    });
    const json = await res.json();
    if (json.organization) {
      setOrg(json.organization);
      setSaved(true);
    }
  };

  if (!org) return <p className="text-sm text-[var(--c-text-2)]">{t('loading')}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[var(--c-text)]">{t('settingsTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('settingsHint')}</p>
      </div>

      <section className="mq-console-surface space-y-3 rounded-xl p-4">
        <h3 className="text-sm font-bold text-[var(--c-text)]">{t('company')}</h3>
        <label className="block text-sm text-[var(--c-text-2)]">
          {t('name')}
          <input className="mq-console-input mt-1 w-full" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm text-[var(--c-text-2)]">
          {t('industry')}
          <input
            className="mq-console-input mt-1 w-full"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </label>
        <p className="text-xs text-[var(--c-text-2)]">
          Slug: <span className="text-[var(--c-primary)]">{org.slug}</span> · Plan: {org.plan}
        </p>
      </section>

      <section className="mq-console-surface space-y-3 rounded-xl p-4">
        <h3 className="text-sm font-bold text-[var(--c-text)]">{t('whiteLabel')}</h3>
        <label className="block text-sm text-[var(--c-text-2)]">
          Logo URL
          <input
            className="mq-console-input mt-1 w-full"
            value={wl.logoUrl || ''}
            onChange={(e) => setWl((p) => ({ ...p, logoUrl: e.target.value }))}
          />
        </label>
        <label className="block text-sm text-[var(--c-text-2)]">
          {t('primaryColor')}
          <input
            type="color"
            className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-[var(--c-border)] bg-transparent"
            value={wl.primaryColor || '#14B8A6'}
            onChange={(e) => setWl((p) => ({ ...p, primaryColor: e.target.value }))}
          />
        </label>
        <label className="block text-sm text-[var(--c-text-2)]">
          {t('font')}
          <select
            className="mq-console-input mt-1 w-full"
            value={wl.font || 'Inter'}
            onChange={(e) => setWl((p) => ({ ...p, font: e.target.value }))}
          >
            {['Inter', 'Cairo', 'Tajawal', 'IBM Plex Sans Arabic'].map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-[var(--c-text-2)]">
          {t('fromEmail')}
          <input
            className="mq-console-input mt-1 w-full"
            value={wl.fromEmail || ''}
            onChange={(e) => setWl((p) => ({ ...p, fromEmail: e.target.value }))}
          />
        </label>
        <label className="block text-sm text-[var(--c-text-2)]">
          {t('customDomain')}
          <input
            className="mq-console-input mt-1 w-full"
            value={wl.customDomain || ''}
            onChange={(e) => setWl((p) => ({ ...p, customDomain: e.target.value }))}
            placeholder="hire.company.com"
          />
        </label>
      </section>

      <section className="mq-console-card p-4">
        <h3 className="text-sm font-bold text-[var(--c-text)]">{t('billing')}</h3>
        <p className="mt-2 text-sm text-[var(--c-text-2)]">
          {org.plan} · {t('billingHint')}
        </p>
      </section>

      <button type="button" className="mq-console-btn-primary" onClick={() => void save()}>
        {t('save')}
      </button>
      {saved ? <p className="text-sm text-[#22C55E]">{t('saved')}</p> : null}
    </div>
  );
}
