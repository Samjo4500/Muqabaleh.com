'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function GuestInterviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const t = useTranslations('guest');
  const router = useRouter();
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    params.then(({ token: tkn }) => {
      setToken(tkn);
    });
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

      if (res.ok) {
        setConfirmed(true);
        // Redirect to guest interview room
        setTimeout(() => {
          router.push(`/interview/guest/${token}/room`);
        }, 1500);
        return;
      }

      toast.error(t('startError'));
    } catch {
      toast.error(t('startError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-4 py-12">
      <div className="aurora-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + Company Info */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 2L26 8v12l-12 6-12-6V8l12-6z" stroke="#D4A843" strokeWidth="1.5" fill="none" />
              <path d="M14 8l6 3v6l-6 3-6-3v-6l6-3z" fill="#D4A843" opacity="0.2" />
              <circle cx="14" cy="14" r="2" fill="#D4A843" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gold">{t('companyName')}</p>
          <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{t('position')}</p>
          <div className="mt-2">
            <Badge variant="outline" className="border-cyan/30 bg-cyan/10 text-cyan">
              {t('typeAI')}
            </Badge>
          </div>
        </div>

        {confirmed ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10">
              <CheckCircle2 size={32} strokeWidth={1.75} className="text-emerald" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('confirmed')}</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{t('confirmedSub')}</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-[var(--text-muted)]">{t('name')}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="glass-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-[var(--text-muted)]">{t('email')}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  className="mt-0.5 border-white/20 data-[state=checked]:border-gold data-[state=checked]:bg-gold"
                />
                <Label htmlFor="consent" className="cursor-pointer text-sm text-[var(--text-muted)] leading-relaxed">
                  {t('consent')}
                </Label>
              </div>

              <Button
                type="submit"
                className="btn-gold w-full cursor-pointer"
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
