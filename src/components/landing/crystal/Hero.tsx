import Link from 'next/link';
import { localePath } from '@/i18n/navigation';
import { BrandLogo } from './BrandLogo';
import { C, type Bi } from './copy';
import { HeroLcpImage } from './HeroLcpImage';
import { HeroPassportStatic } from './HeroPassportStatic';
import { MENA_JEANNIE_FRAMES } from './mena-hero-frames';

const HERO_SCORE = 86;
const HERO_GRADE = 'A';

function pick(bi: Bi, locale: string) {
  return locale === 'ar' ? bi.ar : bi.en;
}

/**
 * First-paint hero — server HTML, static 768w LCP image, no framer-motion.
 * City carousel was delaying LCP (opacity 0.55 + scale-up on the LCP node).
 */
export function CrystalHero({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const current = MENA_JEANNIE_FRAMES[0];
  const cityLabel = isAr ? current.cityAr : current.cityEn;
  const dir = isAr ? 'rtl' : 'ltr';
  const lang = isAr ? 'ar' : 'en';

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <HeroLcpImage
          alt={isAr ? current.altAr : current.altEn}
          objectPosition={current.objectPosition}
        />
        <div className="mq-hero-shade absolute inset-0" />
      </div>

      <div className="mq-hero-score-anchor">
        <HeroPassportStatic
          locale={locale}
          cityEn={current.cityEn}
          cityAr={current.cityAr}
          score={HERO_SCORE}
          grade={HERO_GRADE}
        />
      </div>

      <div className="mq-wrap relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:justify-center md:pb-24 md:pt-32">
        <div className="max-w-3xl text-white">
          <div className="mq-logo-glow relative mb-5 inline-flex">
            <div
              className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.35)_0%,transparent_68%)]"
              aria-hidden
            />
            <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="relative inline-flex">
              <BrandLogo size="hero" className="drop-shadow-[0_12px_40px_rgba(45,212,191,0.35)]" />
            </Link>
          </div>

          <p className="mq-kicker mb-3 text-teal-200/90">
            {isAr ? `جيني · ${cityLabel}` : `Jeannie · ${cityLabel}`}
          </p>

          <p
            className="mb-3 inline-flex max-w-full flex-wrap items-center gap-2.5 text-3xl font-bold tracking-tight text-white md:gap-3 md:text-4xl"
            dir="ltr"
            aria-label="Jeannie جيني"
          >
            <span className="mq-display">Jeannie</span>
            <span className="mq-jeannie-ar text-teal-100" dir="rtl" lang="ar">
              جيني
            </span>
          </p>

          <h1
            className="mq-display mb-5 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            dir={dir}
            lang={lang}
          >
            {pick(C.hero.headline, locale)}
          </h1>

          <p
            className="mb-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
            dir={dir}
            lang={lang}
          >
            {pick(C.hero.sub, locale)}
          </p>

          <ol
            className="mb-6 grid max-w-xl grid-cols-1 gap-2 sm:grid-cols-2 lg:max-w-2xl"
            aria-label={isAr ? 'مسار المرشّح' : 'Candidate journey'}
          >
            {C.hero.journey.map((step, i) => (
              <li key={step.en} className="flex items-start gap-2.5 text-sm leading-snug text-white/75">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-teal-300/35 bg-teal-400/10 text-[10px] font-bold text-teal-200">
                  {i + 1}
                </span>
                <span dir={dir} lang={lang}>
                  {pick(step, locale)}
                </span>
              </li>
            ))}
          </ol>

          <div className="mq-hero-score-inline mb-7 md:hidden">
            <HeroPassportStatic
              locale={locale}
              cityEn={current.cityEn}
              cityAr={current.cityAr}
              score={HERO_SCORE}
              grade={HERO_GRADE}
              compact
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={localePath('/interview/prep', locale)} className="mq-btn mq-btn-on-dark mq-btn-shimmer">
              {pick(C.hero.ctaInterview, locale)}
            </Link>
            <Link href={localePath('/jobs', locale)} className="mq-btn mq-btn-on-dark-ghost">
              {pick(C.hero.ctaJeannie, locale)}
            </Link>
          </div>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70" dir={dir} lang={lang}>
            {pick(C.hero.reassure, locale)}
          </p>
          <p className="mt-1.5 text-xs font-semibold tracking-wide text-teal-200/80">
            {pick(C.hero.noCard, locale)}
            <span aria-hidden className="mx-2 text-white/30">
              ·
            </span>
            {pick(C.hero.startMinutes, locale)}
          </p>
          <p className="mt-4 text-xs text-white/45">
            <Link
              href={localePath('/business', locale)}
              className="underline-offset-2 hover:text-white/70 hover:underline"
            >
              {pick(C.hero.forEmployers, locale)}
            </Link>
            <span aria-hidden className="mx-2">
              ·
            </span>
            <Link
              href={localePath('/partners', locale)}
              className="underline-offset-2 hover:text-white/70 hover:underline"
            >
              {pick(C.hero.forPartners, locale)}
            </Link>
          </p>
        </div>
      </div>

      <div className="mq-shine-line pointer-events-none absolute inset-x-0 bottom-10 mx-auto h-px w-40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--mq-paper)] to-transparent" />
    </section>
  );
}
