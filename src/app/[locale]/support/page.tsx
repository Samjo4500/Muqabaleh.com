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

const SECTIONS: {
  key: 'secGettingStarted' | 'secInterviews' | 'secPassport' | 'secBilling' | 'secB2b';
  items: number[];
}[] = [
  { key: 'secGettingStarted', items: [1, 2, 13] },
  { key: 'secInterviews', items: [3, 4, 5] },
  { key: 'secPassport', items: [6, 7] },
  { key: 'secBilling', items: [8, 12, 15] },
  { key: 'secB2b', items: [9, 10, 11, 14] },
];

export default function SupportPage() {
  const t = useTranslations('support');
  const tLanding = useTranslations('landing');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, locale }),
      });
      if (res.ok) {
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        toast.success(t('sent'));
      } else {
        toast.error(isAr ? 'تعذّر الإرسال' : 'Could not send');
      }
    } catch {
      toast.error(isAr ? 'تعذّر الإرسال' : 'Could not send');
    } finally {
      setSending(false);
    }
  };

  return (
    <AtelierShell showHeroLogo>
      <section className="mq-section pb-6 pt-6">
        <div className="mq-wrap mx-auto max-w-3xl text-center">
          <p className="mq-kicker mb-3">Muqabaleh</p>
          <h1 className="mq-display text-4xl font-bold text-white sm:text-5xl">
            {t('title')}
          </h1>
        </div>
      </section>

      <section className="mq-section border-t border-white/10 pt-10">
        <div className="mq-wrap mx-auto max-w-3xl space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.key}>
              <h2 className="mq-display mb-4 text-xl text-white md:text-2xl">
                {t(section.key)}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {section.items.map((n) => (
                  <AccordionItem
                    key={n}
                    value={`faq-${n}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4"
                  >
                    <AccordionTrigger className="min-h-12 text-start text-sm font-medium text-white hover:no-underline">
                      {tLanding(`faqQ${n}`)}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-white/60">
                      {tLanding(`faqA${n}`)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          <p className="rounded-2xl border border-teal-400/20 bg-teal-400/10 px-4 py-4 text-center text-sm text-teal-50">
            {t('ctaBottom')}
          </p>
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
                <label className="mb-1.5 block text-sm font-medium text-white/55">
                  {isAr ? 'الاسم' : 'Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-12 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-teal-400/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/55">
                  {isAr ? 'البريد' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="min-h-12 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-teal-400/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/55">
                  {t('subject')}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="min-h-12 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-teal-400/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/55">
                  {t('message')}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-teal-400/50"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="mq-btn mq-btn-primary min-h-12"
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
