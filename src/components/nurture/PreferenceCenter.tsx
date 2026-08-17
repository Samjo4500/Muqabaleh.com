'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { PREFS_COPY } from '@/lib/nurture/copy';
import { gateCtaClass, gateSecondaryClass } from './GateShell';

type Props = {
  locale: string;
  mode?: 'prefs' | 'unsubscribe';
};

export function PreferenceCenter({ locale, mode = 'prefs' }: Props) {
  const isAr = locale === 'ar';
  const copy = isAr ? PREFS_COPY.ar : PREFS_COPY.en;
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'saved'>('loading');
  const [frequency, setFrequency] = useState('NORMAL');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('missing');
      return;
    }
    fetch(`/api/nurture/prefs?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: { ok?: boolean; frequency?: string }) => {
        if (!data.ok) {
          setStatus('missing');
          return;
        }
        setFrequency(data.frequency || 'NORMAL');
        setStatus('ready');
        if (mode === 'unsubscribe') {
          void apply('UNSUBSCRIBE');
        }
      })
      .catch(() => setStatus('missing'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, mode]);

  const apply = async (action: 'LESS_OFTEN' | 'PAUSE_30' | 'UNSUBSCRIBE' | 'RESUME') => {
    const res = await fetch('/api/nurture/prefs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    });
    if (!res.ok) {
      setStatus('missing');
      return;
    }
    const data = (await res.json()) as { frequency?: string };
    setFrequency(data.frequency || action);
    setMessage(copy.saved);
    setStatus('saved');
  };

  return (
    <div
      className="flex min-h-[100svh] items-center justify-center bg-[#0A0E17] px-4 py-10"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="w-full max-w-[480px] rounded-[20px] border border-white/10 bg-[#0D1117] p-6">
        <div className="mb-5 flex justify-center">
          <BrandLogo size="sm" />
        </div>
        {status === 'missing' ? (
          <p className="text-center text-white/70">{copy.missing}</p>
        ) : (
          <>
            <h1 className="text-center text-[28px] font-extrabold text-white">
              {mode === 'unsubscribe' && status === 'saved' ? copy.unsubTitle : copy.title}
            </h1>
            <p className="mt-2 text-center text-sm text-white/40">
              {mode === 'unsubscribe' && status === 'saved' ? copy.unsubBody : copy.sub}
            </p>
            {message ? (
              <p className="mt-3 text-center text-sm text-[#00D4AA]">{message}</p>
            ) : null}
            <p className="mt-2 text-center text-xs text-white/35">
              {isAr ? 'الحالة الحالية:' : 'Current:'} {frequency}
            </p>
            <div className="mt-6 space-y-3">
              <button type="button" className={gateCtaClass} onClick={() => void apply('LESS_OFTEN')}>
                {copy.less}
              </button>
              <button
                type="button"
                className={gateSecondaryClass}
                onClick={() => void apply('PAUSE_30')}
              >
                {copy.pause}
              </button>
              <button
                type="button"
                className="inline-flex h-12 w-full items-center justify-center rounded-3xl border border-white/15 text-sm font-bold text-white/70 hover:bg-white/5"
                onClick={() => void apply('UNSUBSCRIBE')}
              >
                {copy.unsub}
              </button>
              <button
                type="button"
                className="w-full text-center text-sm text-white/45 underline-offset-2 hover:underline"
                onClick={() => void apply('RESUME')}
              >
                {copy.resume}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
