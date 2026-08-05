'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Globe2,
  KeyRound,
  Palette,
  ShieldCheck,
  Sparkles,
  Webhook,
} from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { localePath } from '@/i18n/navigation';

const FEATURES = [
  { icon: Palette, key: 'featBrand' },
  { icon: Globe2, key: 'featDomain' },
  { icon: KeyRound, key: 'featApi' },
  { icon: Webhook, key: 'featWebhooks' },
  { icon: ShieldCheck, key: 'featRevenue' },
  { icon: Sparkles, key: 'featClients' },
] as const;

export default function PartnersLandingPage() {
  const t = useTranslations('partnersMarketing');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const enterDemo = async () => {
    const res = await fetch('/api/auth/demo-partner-login', { method: 'POST' });
    if (res.ok) {
      window.location.href = localePath('/partner', locale);
    }
  };

  return (
    <div className="mq-atelier relative min-h-screen overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
      </div>
      <CrystalNavbar />

      <main>
        <section className="mq-wrap relative pb-16 pt-10 md:pb-24 md:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 flex justify-center">
              <Link href={localePath('/', locale)} aria-label="Muqabaleh">
                <BrandLogo
                  size="hero"
                  priority
                  className="mq-logo-glow relative drop-shadow-[0_12px_40px_rgba(45,212,191,0.35)]"
                />
              </Link>
            </div>
            <p className="mq-kicker mb-3">{t('eyebrow')}</p>
            <h1 className="mq-display mb-5 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              {t('title')}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base text-white/60 md:text-lg">{t('sub')}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={localePath('/partners/apply', locale)}
                className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center gap-2 px-7 text-sm font-bold"
              >
                {t('applyCta')}
                <ArrowUpRight size={16} />
              </Link>
              <button
                type="button"
                onClick={enterDemo}
                className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center px-7 text-sm font-bold"
              >
                {t('demoCta')}
              </button>
            </div>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.article
                  key={f.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="mq-panel mq-facet mq-facet-teal p-5"
                >
                  <Icon className="mb-3 text-teal-300" size={22} />
                  <h2 className="mb-2 text-lg font-bold text-white">{t(`${f.key}Title`)}</h2>
                  <p className="text-sm leading-relaxed text-white/55">{t(`${f.key}Body`)}</p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="mq-section !pt-0">
          <div className="mq-wrap">
            <div className="mq-facet mq-facet-gold relative overflow-hidden rounded-[2rem] border border-amber-200/25 px-6 py-12 text-center md:px-12">
              <h2 className="mq-display text-2xl font-bold text-white md:text-4xl">{t('ctaTitle')}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/55 md:text-base">{t('ctaBody')}</p>
              <Link
                href={localePath('/partners/apply', locale)}
                className="mq-btn mq-btn-primary mq-btn-shimmer relative mt-8 inline-flex min-h-[48px] items-center gap-2 px-7 text-sm font-bold"
              >
                {t('applyCta')}
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <CrystalFooter />
    </div>
  );
}
