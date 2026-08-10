'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, Mail } from 'lucide-react';
import { attributionPayload } from '@/lib/marketing/attribution';

type Props = {
  variant?: 'footer' | 'inline';
};

export function NewsletterCapture({ variant = 'footer' }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || undefined,
          locale,
          marketingOptIn: true,
          ...attributionPayload(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed');
      }
      setDone(true);
      setEmail('');
      setName('');
    } catch {
      setError(isAr ? 'تعذّر التسجيل. حاول مرة أخرى.' : 'Could not subscribe. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-teal-200">
        {isAr ? 'شكراً — سنرسل لك نصائح الوظائف والمقابلات.' : 'Thanks — job & interview tips are on the way.'}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={variant === 'footer' ? 'space-y-3' : 'space-y-3'}>
      <div>
        <p className="mb-1 text-sm font-bold text-white">
          {isAr ? 'نصائح وظائف ومقابلات' : 'Job & interview tips'}
        </p>
        <p className="text-xs text-white/45">
          {isAr
            ? 'بريدك + اسمك — عروض عمل، تدريب جيني، وتحديثات الجواز.'
            : 'Your email + name — roles, Jeannie practice tips, and passport updates.'}
        </p>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={isAr ? 'الاسم (اختياري)' : 'Name (optional)'}
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/35"
        autoComplete="name"
      />
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Mail
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/35"
            size={14}
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isAr ? 'بريدك الإلكتروني' : 'Your email'}
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pe-3 ps-9 text-sm text-white placeholder:text-white/35"
            autoComplete="email"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-teal-400/90 px-3 py-2 text-sm font-semibold text-black transition hover:bg-teal-300 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isAr ? 'اشترك' : 'Join'}
        </button>
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <p className="text-[10px] leading-relaxed text-white/35">
        {isAr
          ? 'بالاشتراك توافق على رسائل تسويقية من مقابلة. يمكنك إلغاء الاشتراك في أي وقت.'
          : 'By joining you agree to marketing emails from Muqabaleh. Unsubscribe anytime.'}
      </p>
    </form>
  );
}
