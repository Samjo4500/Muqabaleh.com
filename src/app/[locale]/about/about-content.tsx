'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import {
  Target,
  Eye,
  Users,
  Globe,
  Shield,
  Sparkles,
} from 'lucide-react';
import { SectionHeading, GlowCard } from '@/components/brand';

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

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('eyebrow')}
              title={t('heroH1')}
              titleHighlight={t('heroH1Highlight')}
              sub={t('heroSub')}
            />
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="border-t border-white/5 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              <GlowCard className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <Target size={24} className="text-gold" strokeWidth={1.75} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--text-primary)]">
                  {t('missionTitle')}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  {t('missionDesc')}
                </p>
              </GlowCard>
              <GlowCard className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10">
                  <Eye size={24} className="text-emerald" strokeWidth={1.75} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--text-primary)]">
                  {t('visionTitle')}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  {t('visionDesc')}
                </p>
              </GlowCard>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-t border-white/5 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('valuesEyebrow')}
              title={t('valuesTitle')}
              titleHighlight={t('valuesTitle')}
              sub={t('valuesSub')}
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((v) => {
                const Icon = v.icon;
                return (
                  <GlowCard key={v.key} className="p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                      <Icon size={20} className="text-gold" strokeWidth={1.75} />
                    </div>
                    <h4 className="mb-2 text-base font-bold text-[var(--text-primary)]">
                      {t(v.key)}
                    </h4>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                      {t(v.descKey)}
                    </p>
                  </GlowCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="border-t border-white/5 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('storyEyebrow')}
              title={t('storyTitle')}
              titleHighlight={t('storyTitle')}
            />
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-[var(--text-muted)]">
              {([1, 2, 3, 4] as const).map((n) => (
                <p key={n}>{t(`storyP${n}`)}</p>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="aurora-bg relative overflow-hidden py-24">
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold md:text-5xl">
              <span className="gold-gradient-text">{t('ctaTitle')}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--text-muted)]">
              {t('ctaSub')}
            </p>
            <a href="/demo" className="btn-gold mt-8 inline-block">
              {tc('startFree')}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
