'use client';

import { useTranslations } from 'next-intl';

export function CrystalSocialProof() {
  const t = useTranslations('landing.testimonials');
  const cards = [1, 2, 3, 4, 5, 6].map((n) => ({
    quote: t(`quote${n}`),
    role: t(`role${n}`),
  }));
  const loop = [...cards, ...cards];
  const trustPills = [t('trust1'), t('trust2'), t('trust3')];

  return (
    <section id="testimonials" className="section-pad relative overflow-hidden">
      <div className="content-wrap mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
          {t('title')}
        </p>
      </div>
      <div className="relative">
        <div className="crystal-marquee flex w-max gap-6 px-4">
          {loop.map((card, i) => (
            <article
              key={`${card.role}-${i}`}
              className="glass w-[280px] shrink-0 rounded-2xl border-[var(--border-glass)] p-8 md:w-[320px]"
            >
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">&ldquo;{card.quote}&rdquo;</p>
              <p className="mt-4 text-xs text-[var(--text-muted)]">{card.role}</p>
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
