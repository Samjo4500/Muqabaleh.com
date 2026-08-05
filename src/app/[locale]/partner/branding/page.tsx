'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Loader2 } from 'lucide-react';
import type { PartnerRecord } from '@/lib/partner/types';
import { Field, PageHeader, Panel } from '@/components/partner/ui';

export default function PartnerBrandingPage() {
  const t = useTranslations('partnerConsole');
  const locale = useLocale();
  const [partner, setPartner] = useState<PartnerRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void fetch('/api/partner/branding')
      .then((r) => r.json())
      .then((d) => setPartner(d.branding));
  }, []);

  const update = (patch: Partial<PartnerRecord>) => {
    setPartner((p) => (p ? { ...p, ...patch } : p));
    if (typeof document !== 'undefined') {
      if (patch.primaryColor) document.documentElement.style.setProperty('--pc-primary', patch.primaryColor);
      if (patch.accentColor) document.documentElement.style.setProperty('--pc-accent', patch.accentColor);
    }
  };

  const save = async () => {
    if (!partner) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/partner/branding', {
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
      <div className="flex min-h-[40vh] items-center justify-center text-white/50">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={t('navBranding')}
        title={t('brandingTitle')}
        description={t('brandingDesc')}
        actions={
          <button type="button" className="pc-btn pc-btn-primary" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
            {t('saveBrand')}
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.05fr]">
        <Panel title={t('brandStudio')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('fieldName')}>
              <input className="pc-input" value={partner.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label={t('fieldDomain')}>
              <input
                className="pc-input"
                value={partner.customDomain || ''}
                onChange={(e) => update({ customDomain: e.target.value })}
                placeholder="hire.yourbrand.com"
              />
            </Field>
            <Field label={t('fieldLogo')}>
              <input
                className="pc-input"
                value={partner.logoUrl || ''}
                onChange={(e) => update({ logoUrl: e.target.value })}
              />
            </Field>
            <Field label={t('fieldSupportEmail')}>
              <input
                className="pc-input"
                value={partner.supportEmail || ''}
                onChange={(e) => update({ supportEmail: e.target.value })}
              />
            </Field>
            <Field label={t('fieldPrimary')}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={partner.primaryColor}
                  onChange={(e) => update({ primaryColor: e.target.value })}
                  className="h-11 w-14 cursor-pointer rounded-lg border border-white/15 bg-transparent"
                />
                <input
                  className="pc-input"
                  value={partner.primaryColor}
                  onChange={(e) => update({ primaryColor: e.target.value })}
                />
              </div>
            </Field>
            <Field label={t('fieldAccent')}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={partner.accentColor}
                  onChange={(e) => update({ accentColor: e.target.value })}
                  className="h-11 w-14 cursor-pointer rounded-lg border border-white/15 bg-transparent"
                />
                <input
                  className="pc-input"
                  value={partner.accentColor}
                  onChange={(e) => update({ accentColor: e.target.value })}
                />
              </div>
            </Field>
            <Field label={t('fieldFromName')}>
              <input
                className="pc-input"
                value={partner.fromEmailName || ''}
                onChange={(e) => update({ fromEmailName: e.target.value })}
              />
            </Field>
            <Field label={t('fieldWebsite')}>
              <input
                className="pc-input"
                value={partner.website || ''}
                onChange={(e) => update({ website: e.target.value })}
              />
            </Field>
          </div>
        </Panel>

        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/40">
            {t('livePreview')}
          </div>
          <div className="pc-preview-frame">
            <div
              className="border-b border-white/10 px-5 py-4"
              style={{
                background: `linear-gradient(135deg, ${partner.primaryColor}33, transparent 60%)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/10">
                  {partner.logoUrl ? (
                    <Image src={partner.logoUrl} alt="" fill className="object-contain p-1" />
                  ) : null}
                </div>
                <div>
                  <div className="font-bold">{partner.name}</div>
                  <div className="text-xs text-white/50">
                    {partner.customDomain || `${partner.slug}.muqabaleh.com`}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <h3 className="pc-display text-2xl font-bold">
                {locale === 'ar' ? 'جاهز لمقابلتك؟' : 'Ready for your interview?'}
              </h3>
              <p className="text-sm text-white/55">
                {locale === 'ar'
                  ? 'تجربة مرشّح بهويتك — ألوانك، نطاقك، وبريدك.'
                  : 'Candidate experience under your brand — your colors, domain, and sender name.'}
              </p>
              <button
                type="button"
                className="rounded-full px-5 py-2.5 text-sm font-bold text-slate-950"
                style={{ background: partner.primaryColor }}
              >
                {locale === 'ar' ? 'ابدأ المقابلة' : 'Start interview'}
              </button>
              <div
                className="rounded-xl border px-4 py-3 text-xs"
                style={{
                  borderColor: `${partner.accentColor}66`,
                  color: partner.accentColor,
                  background: `${partner.accentColor}14`,
                }}
              >
                {partner.fromEmailName || partner.name} · {partner.supportEmail || 'support@…'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
