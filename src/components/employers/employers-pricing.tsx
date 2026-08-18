'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { localePath } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const TIERS = [
  {
    id: 'starter',
    price: 199,
    popular: false,
    cta: 'ctaTrial' as const,
    href: '/console/signup?type=employer',
    features: [
      'f50',
      'f2roles',
      'fBasicDash',
      'fCsv',
      'fEmailSupport',
    ] as const,
  },
  {
    id: 'pro',
    price: 499,
    popular: true,
    cta: 'ctaPro' as const,
    href: '/console/signup?type=employer',
    features: [
      'f200',
      'f25roles',
      'fAdvanced',
      'fBrandPassport',
      'fApi',
      'fPriority',
    ] as const,
  },
  {
    id: 'enterprise',
    price: 999,
    popular: false,
    cta: 'ctaSales' as const,
    href: '#enterprise-form',
    features: [
      'fUnlimited',
      'fUnlimitedRoles',
      'fWhiteLabel',
      'fAts',
      'fSso',
      'fCsm',
    ] as const,
  },
] as const;

const COMPARE_ROWS: { key: string; starter: boolean | string; pro: boolean | string; enterprise: boolean | string }[] = [
  { key: 'cInterviews', starter: '50/mo', pro: '200/mo', enterprise: '∞' },
  { key: 'cRoles', starter: '2', pro: '25+', enterprise: '∞' },
  { key: 'cAnalytics', starter: true, pro: true, enterprise: true },
  { key: 'cPdf', starter: false, pro: true, enterprise: true },
  { key: 'cBrand', starter: false, pro: true, enterprise: true },
  { key: 'cApi', starter: false, pro: true, enterprise: true },
  { key: 'cWhiteLabel', starter: false, pro: false, enterprise: true },
  { key: 'cAts', starter: false, pro: false, enterprise: true },
  { key: 'cSso', starter: false, pro: false, enterprise: true },
  { key: 'cCsm', starter: false, pro: false, enterprise: true },
];

const FAQS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

export function EmployersPricing() {
  const t = useTranslations('employers');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [openFaq, setOpenFaq] = useState<string | null>('q1');
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    teamSize: '11-50',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submitEnterprise = async () => {
    setSending(true);
    const res = await fetch('/api/employers/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, locale }),
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      toast.success(
        isAr
          ? 'تم الإرسال. سنتواصل معك خلال 24 ساعة.'
          : "Sent. We'll contact you within 24 hours.",
      );
    }
  };

  return (
    <div
      className="mq-employers min-h-screen"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <CrystalNavbar locale={locale} />

      <section className="relative overflow-hidden px-4 pb-16 pt-28 md:px-8 md:pt-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(20,184,166,0.22), transparent 55%), linear-gradient(180deg, #0B1120 0%, #0F172A 100%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <BrandLogo size="hero" priority className="mx-auto mb-8" />
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-[1.75rem] font-medium tracking-tight text-[#F8FAFC] md:text-5xl"
          >
            {t('heroHeadline')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mx-auto mt-4 max-w-2xl text-base text-[#94A3B8] md:text-lg"
          >
            {t('heroSub')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="mt-8"
          >
            <Link
              href={localePath('/console/najm-tech', locale)}
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#14B8A6] px-6 text-sm font-medium text-[#042f2e] shadow-[0_12px_40px_rgba(0,0,0,0.22)] transition duration-200 hover:brightness-110"
            >
              {t('ctaTrial')}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[#1E293B] bg-[#0F172A] px-4 py-8 md:px-8">
        <p className="text-center text-sm text-[#94A3B8]">{t('trust')}</p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-[#94A3B8]">
          {isAr
            ? 'الجواز إشارة جاهزية تحت سيطرة المرشّح. استخدمه مع حكم بشري مسؤول — وليس كقرار توظيف تلقائي.'
            : 'The Passport is a candidate-controlled readiness signal. Use it with responsible human judgement — not as an automatic hiring decision.'}
        </p>
        <div className="mt-4 text-center">
          <Link
            href={localePath('/how-scores-work', locale)}
            className="text-sm font-semibold text-[#14B8A6] hover:brightness-110"
          >
            {isAr ? 'كيف تعمل درجات مقابلة' : 'How Muqabaleh scores work'}
          </Link>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'relative rounded-xl border bg-[#0F172A] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)]',
                tier.popular
                  ? 'border-[#D4AF37]'
                  : 'border-[#1E293B]',
              )}
            >
              {tier.popular ? (
                <span className="absolute -top-3 start-6 rounded-md bg-[#D4AF37] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#0B1120]">
                  {t('mostPopular')}
                </span>
              ) : null}
              <h3 className="text-lg font-medium tracking-tight text-[#F8FAFC]">{t(`${tier.id}Title`)}</h3>
              <p className="mt-1 text-sm text-[#94A3B8]">{t(`${tier.id}Desc`)}</p>
              <p className="mt-5 text-[2.35rem] font-medium tracking-tight text-[#F8FAFC]">
                ${tier.price}
                <span className="text-base font-medium text-[#94A3B8]">{t('perMonth')}</span>
              </p>
              <ul className="mt-5 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#F8FAFC]/90">
                    <Check size={16} className="mt-0.5 shrink-0 text-[#14B8A6]" />
                    <span>{t(f)}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={
                  tier.href.startsWith('#')
                    ? tier.href
                    : localePath(tier.href, locale)
                }
                className={cn(
                  'mt-6 flex min-h-[44px] items-center justify-center rounded-lg px-4 text-sm font-medium transition duration-200',
                  tier.popular
                    ? 'bg-[#14B8A6] text-[#042f2e] hover:brightness-110'
                    : 'border border-[#1E293B] bg-white/5 text-[#F8FAFC] hover:border-[#14B8A6]',
                )}
              >
                {t(tier.cta)}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-6xl overflow-x-auto rounded-xl border border-[#1E293B] bg-[#0F172A]">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#94A3B8]">
                <th className="p-4 text-start">{t('feature')}</th>
                <th className="p-4 text-start">{t('starterTitle')}</th>
                <th className="p-4 text-start">{t('proTitle')}</th>
                <th className="p-4 text-start">{t('enterpriseTitle')}</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-[#1E293B]/40 text-[#F8FAFC]">
                  <td className="p-4 text-[#94A3B8]">{t(row.key)}</td>
                  {(['starter', 'pro', 'enterprise'] as const).map((col) => {
                    const val = row[col];
                    return (
                      <td key={col} className="p-4">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check size={16} className="text-[#22C55E]" />
                          ) : (
                            <X size={16} className="text-[#64748B]" />
                          )
                        ) : (
                          val
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-[1.5rem] font-medium tracking-tight text-[#F8FAFC]">{t('faqTitle')}</h2>
          <div className="mt-6 space-y-2">
            {FAQS.map((q) => {
              const open = openFaq === q;
              return (
                <div
                  key={q}
                  className="rounded-xl border border-[#1E293B] bg-[#0F172A]"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start text-sm font-medium text-[#F8FAFC]"
                    onClick={() => setOpenFaq(open ? null : q)}
                  >
                    {t(`${q}Q`)}
                    <span className="text-[#14B8A6]">{open ? '−' : '+'}</span>
                  </button>
                  {open ? (
                    <p className="border-t border-[#1E293B] px-4 py-3 text-sm text-[#94A3B8]">
                      {t(`${q}A`)}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="enterprise-form" className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-xl rounded-xl border border-[#1E293B] bg-[#0F172A] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
          <h2 className="text-lg font-medium tracking-tight text-[#F8FAFC]">{t('enterpriseFormTitle')}</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">{t('enterpriseFormSub')}</p>
          <div className="mt-4 grid gap-3">
            {(
              [
                ['name', 'name'],
                ['company', 'company'],
                ['email', 'email'],
                ['phone', 'phone'],
              ] as const
            ).map(([field, labelKey]) => (
              <input
                key={field}
                className="min-h-[44px] rounded-lg border border-[#1E293B] bg-[#0B1120] px-3 text-sm text-[#F8FAFC] outline-none focus:border-[#14B8A6]"
                placeholder={t(labelKey)}
                type={field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              />
            ))}
            <select
              className="min-h-[44px] rounded-lg border border-[#1E293B] bg-[#0B1120] px-3 text-sm text-[#F8FAFC]"
              value={form.teamSize}
              onChange={(e) => setForm((p) => ({ ...p, teamSize: e.target.value }))}
            >
              {['1-10', '11-50', '51-200', '201-1000', '1000+'].map((s) => (
                <option key={s} value={s}>
                  {t('teamSize')}: {s}
                </option>
              ))}
            </select>
            <textarea
              className="min-h-[88px] rounded-lg border border-[#1E293B] bg-[#0B1120] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#14B8A6]"
              placeholder={isAr ? 'رسالة (اختياري)' : 'Message (optional)'}
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            />
            <button
              type="button"
              disabled={sending}
              onClick={() => void submitEnterprise()}
              className="min-h-[44px] rounded-lg bg-[#14B8A6] text-sm font-medium text-[#042f2e] transition duration-200 hover:brightness-110"
            >
              {sending ? t('sending') : t('ctaSales')}
            </button>
            {sent ? <p className="text-sm text-[#22C55E]">{t('sent')}</p> : null}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-[#1E293B] bg-gradient-to-br from-[#0F172A] to-[#0B1120] px-6 py-10 text-center">
          <h2 className="text-[1.5rem] font-medium tracking-tight text-[#F8FAFC] md:text-3xl">{t('bottomCta')}</h2>
          <Link
            href={localePath('/console/signup?type=employer', locale)}
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#14B8A6] px-6 text-sm font-medium text-[#042f2e]"
          >
            {t('ctaTrial')}
          </Link>
        </div>
      </section>

      <CrystalFooter />
    </div>
  );
}
