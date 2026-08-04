'use client';

import { useTranslations } from 'next-intl';

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
  const trustPills = [t('trustPill1'), t('trustPill2'), t('trustPill3'), t('trustPill4')];

  return (
    <section id="testimonials" className="section-pad relative overflow-hidden">
      <div className="relative">
        <div className="crystal-marquee flex w-max gap-6 px-4">
          {loop.map((card, i) => (
            <article
              key={`${card.name}-${i}`}
              className="glass w-[280px] shrink-0 rounded-2xl p-8 md:w-[320px]"
            >
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">&ldquo;{card.quote}&rdquo;</p>
              <p className="mt-4 text-xs text-[var(--text-muted)]">{card.name}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="content-wrap mt-10 flex flex-wrap items-center justify-center gap-3">
        {trustPills.map((label) => (
          <div
            key={label}
            className="glass rounded-full px-5 py-2.5 text-sm text-[var(--text-secondary)] transition hover:border-white/20"
          >
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
