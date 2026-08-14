'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { BiInline, T } from '@/components/landing/crystal/BiText';
import { C, type Bi } from '@/components/landing/crystal/copy';
import { fadeUp, stagger } from '@/components/landing/crystal/motion';
import { localePath } from '@/i18n/navigation';
import { trackSignupInitiated } from '@/lib/analytics-ga';

type ParkedCopy = {
  kicker: Bi;
  title: Bi;
  body: Bi;
  ctaPassport: Bi;
  ctaJeannie: Bi;
  ctaHire?: Bi;
};

export function FeatureParked({ copy }: { copy: ParkedCopy }) {
  const locale = useLocale();

  return (
    <div className="mq-atelier relative min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 mq-seeker-mesh opacity-70" aria-hidden />
      <div
        className="pointer-events-none absolute -start-20 top-24 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-16 bottom-20 h-80 w-80 rounded-full bg-amber-200/10 blur-3xl"
        aria-hidden
      />

      <header className="mq-wrap relative flex items-center justify-between py-6">
        <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="inline-flex">
          <BrandLogo size="nav" priority />
        </Link>
        <Link
          href={localePath('/interview/prequal', locale)}
          className="mq-btn mq-btn-primary !min-h-[42px] !px-4 !py-2 text-sm"
          onClick={() => trackSignupInitiated({ location: 'homepage', locale })}
        >
          <BiInline bi={C.nav.getStarted} />
        </Link>
      </header>

      <main className="mq-wrap relative flex min-h-[calc(100svh-88px)] flex-col justify-center pb-20 pt-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-2xl text-center"
        >
          <motion.p variants={fadeUp} className="mq-kicker mb-4">
            <BiInline bi={copy.kicker} />
          </motion.p>
          <motion.div variants={fadeUp}>
            <T
              as="h1"
              bi={copy.title}
              className="mq-display mb-5 text-3xl font-bold tracking-tight text-white md:text-5xl"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <T
              as="p"
              bi={copy.body}
              className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-white/65 md:text-lg"
            />
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href={localePath('/interview/prequal', locale)}
              className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center justify-center"
            >
              <BiInline bi={copy.ctaPassport} />
            </Link>
            <Link
              href={localePath('/#jeannie', locale)}
              className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center justify-center"
            >
              <BiInline bi={copy.ctaJeannie} />
            </Link>
            {copy.ctaHire ? (
              <Link
                href={localePath('/business', locale)}
                className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center justify-center"
              >
                <BiInline bi={copy.ctaHire} />
              </Link>
            ) : null}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
