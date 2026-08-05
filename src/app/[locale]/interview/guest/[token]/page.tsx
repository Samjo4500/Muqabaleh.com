'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';

export default function GuestInterviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const t = useTranslations('guest');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    params.then(({ token: tkn }) => setToken(tkn));
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/guest/${token}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'start', guestName: name, guestEmail: email }),
      });

      if (!res.ok) {
        toast.error(t('startError'));
        return;
      }

      const data = await res.json();
      try {
        sessionStorage.setItem(
          `mq-guest-start:${token}`,
          JSON.stringify({
            question: data.question,
            questionNumber: data.questionNumber,
            totalQuestions: data.totalQuestions,
            guestName: name,
          }),
        );
      } catch {
        // storage unavailable — room will attempt start (may no-op if already IN_PROGRESS)
      }

      setConfirmed(true);
      window.setTimeout(() => {
        router.push(localePath(`/interview/guest/${token}/room`, locale));
      }, 900);
    } catch {
      toast.error(t('startError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mq-atelier relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href={localePath('/', locale)} className="mb-5" aria-label="Muqabaleh">
            <BrandLogo size="lg" />
          </Link>
          <p className="mq-kicker mb-2">{t('companyName')}</p>
          <p className="mq-display text-xl font-bold text-white">{t('position')}</p>
          <span className="mt-3 inline-flex rounded-lg border border-teal-300/25 bg-teal-400/10 px-2.5 py-1 text-[11px] font-bold text-teal-300">
            {t('typeAI')}
          </span>
        </div>

        {confirmed ? (
          <div className="mq-panel mq-facet mq-facet-teal mq-facet-shape-soft p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/15">
              <CheckCircle2 size={32} className="text-teal-300" />
            </div>
            <h2 className="mq-display text-xl font-bold text-white">{t('confirmed')}</h2>
            <p className="mt-2 text-sm text-white/60">{t('confirmedSub')}</p>
          </div>
        ) : (
          <div className="mq-panel mq-facet mq-facet-gold mq-facet-shape-soft p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-white/55">{t('name')}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/35"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-white/55">{t('email')}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/35"
                  required
                />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  className="mt-0.5 border-white/20 data-[state=checked]:border-teal-300 data-[state=checked]:bg-teal-400"
                />
                <Label htmlFor="consent" className="cursor-pointer text-sm leading-relaxed text-white/55">
                  {t('consent')}
                </Label>
              </div>

              <Button
                type="submit"
                className="mq-btn mq-btn-primary w-full"
                disabled={!consent || loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="me-2 animate-spin" />
                    {t('starting')}
                  </>
                ) : (
                  t('startInterview')
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
