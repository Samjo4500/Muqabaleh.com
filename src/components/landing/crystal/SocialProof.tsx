'use client';

import { useTranslations } from 'next-intl';

const PARTNERS = ['Northstar', 'EduLink', 'HireFlow', 'Apex Labs', 'BrightPath', 'Orbit HR'];

export function CrystalSocialProof() {
  const t = useTranslations('crystal');
  const cards = [
    { quote: t('socialT1'), name: t('socialT1Name') },
    { quote: t('socialT2'), name: t('socialT2Name') },
    { quote: t('socialT3'), name: t('socialT3Name') },
    { quote: t('socialT4'), name: t('socialT4Name') },
    { quote: t('socialT5'), name: t('socialT5Name') },
    { quote: t('socialT6'), name: t('socialT6Name') },
  ];
  const loop = [...cards, ...cards];

  return (
    <section id="testimonials" className="relative overflow-hidden py-16 md:py-24">
      <div className="mb-8 px-4 text-center md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]">
          {t('trustPartners')}
        </p>
      </div>
      <div className="relative">
        <div className="crystal-marquee flex w-max gap-4 px-4">
          {loop.map((card, i) => (
            <article
              key={`${card.name}-${i}`}
              className="glass w-[280px] shrink-0 rounded-2xl p-5 md:w-[320px]"
            >
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">&ldquo;{card.quote}&rdquo;</p>
              <p className="mt-4 text-xs text-[var(--text-muted)]">{card.name}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4">
        {PARTNERS.map((name) => (
          <div
            key={name}
            className="glass group rounded-xl px-5 py-3 text-sm text-[var(--text-faint)] grayscale transition hover:-translate-y-1 hover:text-[var(--text-primary)] hover:grayscale-0"
          >
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
