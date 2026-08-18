import Link from 'next/link';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { CrystalFAQ } from './FAQ';
import { C, type Bi } from './copy';

function pick(bi: Bi, locale: string) {
  return locale === 'ar' ? bi.ar : bi.en;
}

/**
 * First-paint HTML for below-fold cinematic sections. No framer-motion.
 * Replaced by the motion islands only after IntersectionObserver fires.
 */
export function BelowFoldStatic({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const lang = isAr ? 'ar' : 'en';

  return (
    <>
      <section id="passport" className="mq-section scroll-mt-28">
        <div className="mq-wrap">
          <div className="max-w-xl">
            <p className="mq-kicker mb-3" dir={dir} lang={lang}>
              {pick(C.passport.eyebrow, locale)}
            </p>
            <h2
              className="mq-display mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl"
              dir={dir}
              lang={lang}
            >
              {pick(C.passport.title, locale)}
            </h2>
            <p className="mb-6 text-base text-white/60 md:text-lg" dir={dir} lang={lang}>
              {pick(C.passport.sub, locale)}
            </p>
            <ul className="mb-8 space-y-3">
              {C.passport.bullets.map((b) => (
                <li key={b.en} className="flex items-start gap-3 text-sm text-white/70 md:text-base">
                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/10 text-teal-300">
                    <ShieldCheck size={12} />
                  </span>
                  <span dir={dir} lang={lang}>
                    {pick(b, locale)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={localePath('/interview/prequal', locale)}
                className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center gap-2 px-6 text-sm font-bold"
              >
                <Sparkles size={16} />
                {pick(C.passport.cta, locale)}
              </Link>
              <Link
                href={localePath('/how-scores-work', locale)}
                className="inline-flex min-h-[44px] items-center text-sm font-semibold text-teal-300 hover:text-teal-200"
              >
                {pick(C.passport.scoresLink, locale)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="jeannie" className="mq-section mq-jeannie scroll-mt-28">
        <div className="mq-wrap">
          <div className="mb-8 max-w-2xl md:mb-10">
            <p className="mq-kicker mb-3" dir={dir} lang={lang}>
              {pick(C.jeannie.eyebrow, locale)}
            </p>
            <h2
              className="mq-display mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl"
              dir={dir}
              lang={lang}
            >
              {pick(C.jeannie.title, locale)}
            </h2>
            <p className="text-base text-white/65 md:text-lg" dir={dir} lang={lang}>
              {pick(C.jeannie.body, locale)}
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {C.jeannie.offers.map((offer) => (
              <li
                key={offer.key}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-5"
              >
                <h3 className="mq-display mb-2 text-lg font-bold text-white" dir={dir} lang={lang}>
                  {pick(offer.title, locale)}
                </h3>
                <p className="text-sm leading-relaxed text-white/55" dir={dir} lang={lang}>
                  {pick(offer.desc, locale)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href={localePath('/interview/prep', locale)}
              className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center px-6 text-sm font-bold"
            >
              {pick(C.jeannie.cta, locale)}
            </Link>
          </div>
        </div>
      </section>

      <section id="pricing" className="mq-section mq-pricing scroll-mt-28">
        <div className="mq-wrap">
          <h2
            className="mq-display mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl"
            dir={dir}
            lang={lang}
          >
            {pick(C.pricing.title, locale)}
          </h2>
          <p className="mb-8 max-w-2xl text-base text-white/65 md:text-lg" dir={dir} lang={lang}>
            {pick(C.pricing.subtitle, locale)}
          </p>
          <p className="mb-8 text-sm text-white/60" dir={dir} lang={lang}>
            {pick(C.pricing.notSpam.line, locale)}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {C.pricing.plans.map((plan) => (
              <article
                key={plan.id}
                className="flex flex-col rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6"
              >
                <h3 className="mq-display text-xl font-bold text-white" dir={dir} lang={lang}>
                  {pick(plan.name, locale)}
                </h3>
                <p className="mt-2 text-2xl font-black text-teal-200">
                  {pick(plan.price, locale)}
                  <span className="text-sm font-semibold text-white/50">{pick(plan.period, locale)}</span>
                </p>
                <p className="mt-2 text-sm text-white/55" dir={dir} lang={lang}>
                  {pick(plan.tagline, locale)}
                </p>
                <Link
                  href={localePath(plan.href, locale)}
                  className="mq-btn mq-btn-primary mt-5 inline-flex min-h-[44px] items-center justify-center px-4 text-sm font-bold"
                >
                  {pick(plan.cta, locale)}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CrystalFAQ locale={locale} />

      <section className="mq-section relative overflow-hidden">
        <div className="mq-wrap relative">
          <div className="rounded-[2.25rem] border border-teal-300/25 px-6 py-16 text-center md:px-12 md:py-24">
            <h2
              className="mq-display mx-auto mb-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl"
              dir={dir}
              lang={lang}
            >
              {pick(C.finalCta.headline, locale)}
            </h2>
            <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
              <Link
                href={localePath('/interview/prep', locale)}
                className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[52px] items-center justify-center px-6 text-sm font-bold"
              >
                {pick(C.finalCta.startFree, locale)}
              </Link>
              <Link
                href={localePath('/request-demo', locale)}
                className="mq-btn mq-btn-ghost inline-flex min-h-[52px] items-center justify-center px-6 text-sm font-bold"
              >
                {pick(C.finalCta.hiring, locale)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
