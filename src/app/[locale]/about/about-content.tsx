'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Target, Eye, Users, Globe, Shield, Sparkles } from 'lucide-react';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { fadeUp, stagger } from '@/components/landing/crystal/motion';
import { localePath } from '@/i18n/navigation';

const VALUES = [
  { icon: Target, key: 'v1Title', descKey: 'v1Desc' },
  { icon: Eye, key: 'v2Title', descKey: 'v2Desc' },
  { icon: Users, key: 'v3Title', descKey: 'v3Desc' },
  { icon: Globe, key: 'v4Title', descKey: 'v4Desc' },
  { icon: Shield, key: 'v5Title', descKey: 'v5Desc' },
  { icon: Sparkles, key: 'v6Title', descKey: 'v6Desc' },
] as const;

export default function AboutContent() {
  const t = useTranslations('about');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <AtelierShell showHeroLogo>
      <section className="mq-section relative overflow-hidden pb-10 pt-6">
        <div className="mq-wrap relative mx-auto max-w-3xl text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.p variants={fadeUp} className="mq-kicker mb-3">
              {t('eyebrow')}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mq-display mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              {t('heroH1')}{' '}
              <span className="bg-gradient-to-r from-teal-200 to-amber-200 bg-clip-text text-transparent">
                {t('heroH1Highlight')}
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto max-w-xl text-base text-white/60 md:text-lg">
              {t('heroSub')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="mq-section border-t border-white/10 pt-0">
        <div className="mq-wrap grid gap-5 md:grid-cols-2">
          {[
            { icon: Target, title: t('missionTitle'), desc: t('missionDesc'), tone: 'teal' },
            { icon: Eye, title: t('visionTitle'), desc: t('visionDesc'), tone: 'gold' },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
                    card.tone === 'teal' ? 'bg-teal-400/15 text-teal-200' : 'bg-amber-300/15 text-amber-200'
                  }`}
                >
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h2 className="mq-display mb-3 text-xl text-white">{card.title}</h2>
                <p className="text-sm leading-relaxed text-white/60">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mq-section border-t border-white/10">
        <div className="mq-wrap">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mq-kicker mb-3">{t('valuesEyebrow')}</p>
            <h2 className="mq-display text-3xl text-white md:text-4xl">{t('valuesTitle')}</h2>
            <p className="mt-3 text-white/60">{t('valuesSub')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.key}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-teal-300/30"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/12 text-teal-200">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white">{t(v.key)}</h3>
                  <p className="text-sm leading-relaxed text-white/55">{t(v.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mq-section border-t border-white/10">
        <div className="mq-wrap mx-auto max-w-3xl">
          <p className="mq-kicker mb-3">{t('storyEyebrow')}</p>
          <h2 className="mq-display mb-8 text-3xl text-white md:text-4xl">{t('storyTitle')}</h2>
          <div className="space-y-5 text-sm leading-relaxed text-white/60 md:text-base">
            {([1, 2, 3, 4] as const).map((n) => (
              <p key={n}>{t(`storyP${n}`)}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="mq-section relative overflow-hidden border-t border-white/10">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(45,212,191,0.14), transparent 60%)',
          }}
        />
        <div className="mq-wrap relative mx-auto max-w-3xl text-center">
          <h2 className="mq-display text-3xl text-white md:text-5xl">{t('ctaTitle')}</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">{t('ctaSub')}</p>
          <Link
            href={localePath('/demo', locale)}
            className="mq-btn mq-btn-on-dark mq-btn-shimmer mt-8 inline-flex"
          >
            {tc('startFree')}
          </Link>
        </div>
      </section>
    </AtelierShell>
  );
}
