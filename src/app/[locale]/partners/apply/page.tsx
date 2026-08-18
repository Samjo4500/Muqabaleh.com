'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { localePath } from '@/i18n/navigation';

export default function PartnerApplyPage() {
  const t = useTranslations('partnersMarketing');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    country: '',
    message: '',
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/partner/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) setDone(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mq-atelier relative min-h-screen overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <CrystalNavbar locale={locale} />
      <main className="mq-wrap py-12 md:py-16">
        <div className="mx-auto max-w-xl">
          <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="mb-6 inline-block">
            <BrandLogo
              size="hero"
              priority
              className="mq-logo-glow relative drop-shadow-[0_12px_40px_rgba(45,212,191,0.35)]"
            />
          </Link>
          <h1 className="mq-display mb-2 text-3xl font-bold text-white md:text-4xl">
            {t('applyTitle')}
          </h1>
          <p className="mb-8 text-sm text-white/55">{t('applySub')}</p>

          {done ? (
            <div className="mq-panel mq-facet mq-facet-teal p-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 text-teal-300" size={36} />
              <h2 className="text-xl font-bold text-white">{t('applyThanks')}</h2>
              <p className="mt-2 text-sm text-white/55">{t('applyThanksBody')}</p>
              <Link
                href={localePath('/partners', locale)}
                className="mq-btn mq-btn-ghost mt-6 inline-flex min-h-[44px] items-center px-5 text-sm"
              >
                {t('backPartners')}
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mq-panel space-y-4 p-6 md:p-8">
              {(
                [
                  ['companyName', 'fieldCompany', true],
                  ['contactName', 'fieldContact', true],
                  ['email', 'fieldEmail', true],
                  ['phone', 'fieldPhone', false],
                  ['website', 'fieldWebsite', false],
                  ['country', 'fieldCountry', false],
                ] as const
              ).map(([key, label, required]) => (
                <label key={key} className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/45">
                    {t(label)}
                  </span>
                  <input
                    required={required}
                    type={key === 'email' ? 'email' : 'text'}
                    className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none focus:border-teal-300/45"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </label>
              ))}
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">
                  {t('fieldMessage')}
                </span>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-teal-300/45"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] w-full items-center justify-center gap-2 text-sm font-bold"
              >
                {busy ? <Loader2 className="animate-spin" size={16} /> : null}
                {t('submitApply')}
              </button>
            </form>
          )}
        </div>
      </main>
      <CrystalFooter />
    </div>
  );
}
