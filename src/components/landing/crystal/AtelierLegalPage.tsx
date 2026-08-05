'use client';

import { AtelierShell } from './AtelierShell';

export function AtelierLegalPage({
  title,
  updated,
  paragraphs,
}: {
  title: string;
  updated: string;
  paragraphs: string[];
}) {
  return (
    <AtelierShell showHeroLogo>
      <section className="mq-section pb-20 pt-6">
        <div className="mq-wrap mx-auto max-w-3xl">
          <p className="mq-kicker mb-3">Muqabaleh</p>
          <h1 className="mq-display text-3xl font-bold text-white md:text-5xl">{title}</h1>
          <p className="mt-4 text-sm text-white/45">{updated}</p>
          <div className="mt-10 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-loose text-white/65 md:text-[15px]">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>
    </AtelierShell>
  );
}
