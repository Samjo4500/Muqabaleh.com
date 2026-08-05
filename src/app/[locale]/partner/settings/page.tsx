'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Loader2 } from 'lucide-react';
import type { PartnerRecord } from '@/lib/partner/types';
import { Field, PageHeader, Panel } from '@/components/partner/ui';

export default function PartnerSettingsPage() {
  const t = useTranslations('partnerConsole');
  const [partner, setPartner] = useState<PartnerRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void fetch('/api/partner/settings')
      .then((r) => r.json())
      .then((d) => setPartner(d.partner));
  }, []);

  const save = async () => {
    if (!partner) return;
    setSaving(true);
    try {
      const res = await fetch('/api/partner/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partner),
      });
      const data = await res.json();
      if (data.partner) setPartner(data.partner);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (!partner) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={t('navSettings')}
        title={t('settingsTitle')}
        description={t('settingsDesc')}
        actions={
          <button type="button" className="pc-btn pc-btn-primary" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
            {t('save')}
          </button>
        }
      />

      <Panel title={t('orgProfile')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('fieldName')}>
            <input
              className="pc-input"
              value={partner.name}
              onChange={(e) => setPartner({ ...partner, name: e.target.value })}
            />
          </Field>
          <Field label={t('fieldLegalName')}>
            <input
              className="pc-input"
              value={partner.legalName || ''}
              onChange={(e) => setPartner({ ...partner, legalName: e.target.value })}
            />
          </Field>
          <Field label={t('fieldContact')}>
            <input
              className="pc-input"
              value={partner.contactName}
              onChange={(e) => setPartner({ ...partner, contactName: e.target.value })}
            />
          </Field>
          <Field label={t('fieldPhone')}>
            <input
              className="pc-input"
              value={partner.contactPhone || ''}
              onChange={(e) => setPartner({ ...partner, contactPhone: e.target.value })}
            />
          </Field>
          <Field label={t('fieldCountry')}>
            <input
              className="pc-input"
              value={partner.country || ''}
              onChange={(e) => setPartner({ ...partner, country: e.target.value })}
            />
          </Field>
          <Field label={t('fieldWebsite')}>
            <input
              className="pc-input"
              value={partner.website || ''}
              onChange={(e) => setPartner({ ...partner, website: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
          {t('slugLabel')}: <span className="font-mono text-white">{partner.slug}</span>
          <span className="mx-2 text-white/25">·</span>
          {t('status')}: <span className="text-[var(--pc-primary)]">{partner.status}</span>
        </div>
      </Panel>
    </div>
  );
}
