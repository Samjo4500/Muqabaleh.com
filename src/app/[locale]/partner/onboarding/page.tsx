'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Loader2 } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { Field, PageHeader, Panel } from '@/components/partner/ui';

export default function PartnerOnboardingPage() {
  const t = useTranslations('partnerConsole');
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    logoUrl: '/images/logos/v2-balanced-a-T.webp',
    primaryColor: '#0D9488',
    accentColor: '#E8C97A',
    customDomain: '',
    supportEmail: '',
    fromEmailName: '',
    website: '',
  });

  const finish = async () => {
    setBusy(true);
    try {
      await fetch('/api/partner/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      router.push(localePath('/partner', locale));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow={t('onboardingEyebrow')}
        title={t('onboardingTitle')}
        description={t('onboardingDesc')}
      />

      <div className="mb-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= step ? 'bg-[var(--pc-primary)]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <Panel>
        {step === 0 ? (
          <div className="space-y-3">
            <Field label={t('fieldName')}>
              <input
                className="pc-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label={t('fieldWebsite')}>
              <input
                className="pc-input"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </Field>
            <Field label={t('fieldSupportEmail')}>
              <input
                className="pc-input"
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              />
            </Field>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-3">
            <Field label={t('fieldLogo')}>
              <input
                className="pc-input"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              />
            </Field>
            <Field label={t('fieldPrimary')}>
              <input
                type="color"
                className="h-12 w-full cursor-pointer rounded-xl border border-white/15 bg-transparent"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
              />
            </Field>
            <Field label={t('fieldAccent')}>
              <input
                type="color"
                className="h-12 w-full cursor-pointer rounded-xl border border-white/15 bg-transparent"
                value={form.accentColor}
                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
              />
            </Field>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <Field label={t('fieldDomain')}>
              <input
                className="pc-input"
                placeholder="hire.yourbrand.com"
                value={form.customDomain}
                onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
              />
            </Field>
            <Field label={t('fieldFromName')}>
              <input
                className="pc-input"
                value={form.fromEmailName}
                onChange={(e) => setForm({ ...form, fromEmailName: e.target.value })}
              />
            </Field>
            <p className="text-sm text-white/50">{t('onboardingDnsHint')}</p>
          </div>
        ) : null}

        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            className="pc-btn pc-btn-ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            {t('back')}
          </button>
          {step < 2 ? (
            <button
              type="button"
              className="pc-btn pc-btn-primary"
              onClick={() => setStep((s) => s + 1)}
            >
              {t('continue')}
              <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" className="pc-btn pc-btn-primary" onClick={finish} disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              {t('launchConsole')}
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}
