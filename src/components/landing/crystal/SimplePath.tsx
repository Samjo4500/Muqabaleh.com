import Link from 'next/link';
import { ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { C, type Bi } from './copy';

function pick(bi: Bi, locale: string) {
  return locale === 'ar' ? bi.ar : bi.en;
}

/** Server path — no framer-motion on the first-load JS graph. */
export function CrystalSimplePath({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;
  const dir = isAr ? 'rtl' : 'ltr';
  const lang = isAr ? 'ar' : 'en';

  return (
    <section id="how" className="mq-section scroll-mt-28">
      <div className="mq-wrap">
        <div className="mb-10 max-w-2xl md:mb-12">
          <p className="mq-kicker mb-3" dir={dir} lang={lang}>
            {pick(C.path.eyebrow, locale)}
          </p>
          <h2
            className="mq-display mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl"
            dir={dir}
            lang={lang}
          >
            {pick(C.path.title, locale)}
          </h2>
          <p className="text-base text-white/60 md:text-lg" dir={dir} lang={lang}>
            {pick(C.path.sub, locale)}
          </p>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {C.path.steps.map((step, i) => (
            <li
              key={step.title.en}
              className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-6 md:px-6"
            >
              <span className="mq-display mb-4 block text-4xl font-black text-teal-300/35">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mq-display mb-2 text-xl font-bold text-white" dir={dir} lang={lang}>
                {pick(step.title, locale)}
              </h3>
              <p className="text-sm leading-relaxed text-white/55" dir={dir} lang={lang}>
                {pick(step.body, locale)}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href={localePath('/interview/prep', locale)}
            className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center justify-center gap-2 px-6 text-sm font-bold"
          >
            {pick(C.hero.ctaInterview, locale)}
            <Arrow size={16} />
          </Link>
          <Link
            href={localePath('/jobs', locale)}
            className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center justify-center px-6 text-sm font-bold"
          >
            {pick(C.path.ctaJobs, locale)}
          </Link>
        </div>
      </div>
    </section>
  );
}
