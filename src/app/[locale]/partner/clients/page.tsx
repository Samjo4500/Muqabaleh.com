'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Loader2 } from 'lucide-react';
import type { PartnerClient } from '@/lib/partner/types';
import { Field, PageHeader, Panel } from '@/components/partner/ui';

export default function PartnerClientsPage() {
  const t = useTranslations('partnerConsole');
  const locale = useLocale();
  const [clients, setClients] = useState<PartnerClient[]>([]);
  const [creditsPool, setCreditsPool] = useState(0);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    industry: 'TECH',
    country: 'SA',
    size: 'MEDIUM',
    credits: 10,
    adminEmail: '',
    adminName: '',
    adminPassword: '',
  });

  const load = async () => {
    const res = await fetch('/api/partner/clients');
    const data = await res.json();
    setClients(data.clients || []);
    setCreditsPool(data.creditsPool || 0);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/partner/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setOpen(false);
        setForm({
          name: '',
          industry: 'TECH',
          country: 'SA',
          size: 'MEDIUM',
          credits: 10,
          adminEmail: '',
          adminName: '',
          adminPassword: '',
        });
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={t('navClients')}
        title={t('clientsTitle')}
        description={t('clientsDesc')}
        actions={
          <button type="button" className="pc-btn pc-btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} />
            {t('addClient')}
          </button>
        }
      />

      <div className="mb-5 text-sm text-white/50">
        {t('creditsPool')}: <span className="font-semibold text-[var(--pc-primary)]">{creditsPool}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((c) => (
          <article key={c.id} className="pc-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/40">
                  {c.industry} · {c.country}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  c.status === 'ACTIVE'
                    ? 'bg-emerald-400/15 text-emerald-200'
                    : 'bg-amber-400/15 text-amber-100'
                }`}
              >
                {c.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/[0.03] px-2 py-3">
                <div className="text-lg font-bold tabular-nums">{c.jobsCount}</div>
                <div className="text-[10px] uppercase text-white/40">{t('jobs')}</div>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-2 py-3">
                <div className="text-lg font-bold tabular-nums">{c.interviewsCount}</div>
                <div className="text-[10px] uppercase text-white/40">{t('interviews')}</div>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-2 py-3">
                <div className="text-lg font-bold tabular-nums">{c.credits}</div>
                <div className="text-[10px] uppercase text-white/40">{t('credits')}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-white/35">
              {t('since')} {new Date(c.createdAt).toLocaleDateString(locale === 'ar' ? 'ar' : 'en')}
            </div>
          </article>
        ))}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <Panel title={t('addClient')} className="w-full max-w-lg">
            <form className="space-y-3" onSubmit={submit}>
              <Field label={t('fieldClientName')}>
                <input className="pc-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('fieldIndustry')}>
                  <select className="pc-input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>
                    {['TECH','FINTECH','HEALTHCARE','RETAIL','MANUFACTURING','TELECOM'].map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t('fieldCountry')}>
                  <input className="pc-input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </Field>
              </div>
              <Field label={t('fieldCreditsAssign')}>
                <input type="number" min={1} className="pc-input" value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} />
              </Field>
              <Field label={t('fieldAdminEmail')}>
                <input className="pc-input" type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="pc-btn pc-btn-ghost" onClick={() => setOpen(false)}>{t('cancel')}</button>
                <button type="submit" className="pc-btn pc-btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {t('createClient')}
                </button>
              </div>
            </form>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
