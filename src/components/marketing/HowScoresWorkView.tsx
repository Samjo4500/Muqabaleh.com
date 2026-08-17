'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ShieldCheck } from 'lucide-react';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { localePath } from '@/i18n/navigation';
import { HOW_SCORES } from '@/lib/marketing/how-scores-work';

export function HowScoresWorkView() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const t = (bi: { en: string; ar: string }) => (isAr ? bi.ar : bi.en);

  return (
    <AtelierShell>
      <article className="mq-section pb-20 pt-8">
        <div className="mq-wrap mx-auto max-w-3xl">
          <p className="mq-kicker mb-3">{t(HOW_SCORES.kicker)}</p>
          <h1 className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t(HOW_SCORES.title)}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
            {t(HOW_SCORES.lead)}
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {HOW_SCORES.principles.map((item) => (
              <li
                key={item.title.en}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5"
              >
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/10 text-teal-300">
                  <ShieldCheck size={14} aria-hidden />
                </span>
                <h2 className="mq-display text-lg font-bold text-white">{t(item.title)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{t(item.body)}</p>
              </li>
            ))}
          </ul>

          <section className="mt-12">
            <h2 className="mq-display text-2xl font-bold text-white md:text-3xl">
              {t(HOW_SCORES.notTitle)}
            </h2>
            <ul className="mt-5 space-y-3">
              {HOW_SCORES.notItems.map((item) => (
                <li
                  key={item.en}
                  className="flex items-start gap-3 text-sm leading-relaxed text-white/70 md:text-base"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4A843]" aria-hidden />
                  {t(item)}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-6 py-7 md:px-8">
            <h2 className="mq-display text-2xl font-bold text-white">{t(HOW_SCORES.employersTitle)}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60 md:text-base">
              {t(HOW_SCORES.employersBody)}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mq-display text-2xl font-bold text-white">{t(HOW_SCORES.dataTitle)}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60 md:text-base">
              {t(HOW_SCORES.dataBody)}
            </p>
          </section>

          <section className="mt-12">
            <h2 className="mq-display text-2xl font-bold text-white">{t(HOW_SCORES.faqTitle)}</h2>
            <dl className="mt-6 space-y-4">
              {HOW_SCORES.faqs.map((item) => (
                <div
                  key={item.q.en}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
                >
                  <dt className="text-sm font-bold text-white md:text-base">{t(item.q)}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-white/55">{t(item.a)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="mt-10 text-sm text-white/45">
            <Link
              href={localePath('/privacy', locale)}
              className="font-semibold text-teal-300 hover:text-teal-200"
            >
              {t(HOW_SCORES.privacy)}
            </Link>
            <span aria-hidden className="mx-2">
              ·
            </span>
            <Link
              href={localePath('/terms', locale)}
              className="font-semibold text-teal-300 hover:text-teal-200"
            >
              {t(HOW_SCORES.terms)}
            </Link>
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={localePath('/interview/prep', locale)}
              className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center justify-center px-6 text-sm font-bold"
            >
              {t(HOW_SCORES.cta)}
            </Link>
            <p className="text-xs text-white/45">{t(HOW_SCORES.ctaHint)}</p>
          </div>
        </div>
      </article>
    </AtelierShell>
  );
}
