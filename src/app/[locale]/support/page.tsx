'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';

export default function SupportPage() {
  const t = useTranslations('support');
  const tLanding = useTranslations('landing');
  const locale = useLocale();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubject('');
    setMessage('');
    toast.success(t('sent'));
  };

  return (
    <AtelierShell showHeroLogo>
      <section className="mq-section pb-6 pt-6">
        <div className="mq-wrap mx-auto max-w-3xl text-center">
          <p className="mq-kicker mb-3">Muqabaleh</p>
          <h1 className="mq-display text-4xl font-bold text-white sm:text-5xl">{t('title')}</h1>
        </div>
      </section>

      <section className="mq-section border-t border-white/10 pt-10">
        <div className="mq-wrap mx-auto max-w-3xl">
          <h2 className="mq-display mb-8 text-center text-2xl text-white md:text-3xl">{t('faq')}</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <AccordionItem
                key={n}
                value={`faq-${n}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4"
              >
                <AccordionTrigger className="text-start text-sm font-medium text-white hover:no-underline">
                  {tLanding(`faqQ${n}`)}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-white/60">
                  {tLanding(`faqA${n}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="contact" className="mq-section border-t border-white/10">
        <div className="mq-wrap mx-auto max-w-lg">
          <h2 className="mq-display mb-8 text-center text-2xl text-white md:text-3xl">
            {t('contactForm')}
          </h2>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" lang={locale}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/55">{t('subject')}</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-teal-400/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/55">{t('message')}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-teal-400/50"
                />
              </div>
              <button
                type="submit"
                className="mt-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-semibold text-[var(--bg-deep)]"
              >
                {t('send')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </AtelierShell>
  );
}
