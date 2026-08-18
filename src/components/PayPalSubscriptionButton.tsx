'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchPayPalBrowserConfig } from '@/lib/paypal-browser-config';

interface PayPalSubscriptionButtonProps {
  /** If true, render a compact inline button; if false, render a full card */
  compact?: boolean;
  className?: string;
}

export function PayPalSubscriptionButton({
  compact = false,
  className = '',
}: PayPalSubscriptionButtonProps) {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const t = useTranslations('paypal');
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');

  const tier = String(
    (session?.user as Record<string, unknown> | undefined)?.tier || 'FREE',
  );
  const isPremium = ['JEANNIE', 'JEANNIE_PRO', 'UNLIMITED', 'PREMIUM', 'PRO'].includes(
    tier,
  );

  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPayPalBrowserConfig().then((cfg) => {
      if (mounted) setPaypalClientId(cfg.clientId);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (paypalClientId === null) return;
    if (!paypalClientId || !session || isPremium) {
      setLoading(false);
      return;
    }
    let mounted = true;

    const initPayPal = async () => {
      try {
        const { loadScript } = await import('@paypal/paypal-js');

        const paypal = await loadScript({
          'client-id': paypalClientId,
          vault: true,
          intent: 'subscription',
          locale: locale === 'ar' ? 'ar_SA' : 'en_US',
          currency: 'USD',
        } as any);

        if (!mounted || !paypal || !paypal.Buttons || !containerRef.current) return;

        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
            height: compact ? 40 : 48,
          },
          createSubscription: async () => {
            const res = await fetch('/api/paypal/create-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            const data = (await res.json()) as {
              subscriptionId?: string;
              approveLink?: string;
              error?: string;
            };

            if (!res.ok || data.error) {
              setError(data.error || t('createError'));
              throw new Error(data.error || 'Create failed');
            }
            return data.subscriptionId || '';
          },
          onApprove: async (data) => {
            setActivating(true);
            try {
              const res = await fetch('/api/paypal/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId: data.subscriptionID || '' }),
              });

              if (res.ok) {
                window.location.href =
                  locale === 'ar'
                    ? '/app?upgraded=true'
                    : '/en/app?upgraded=true';
              } else {
                setError(t('activateError'));
              }
            } catch {
              setError(t('activateError'));
            } finally {
              setActivating(false);
            }
          },
          onCancel: () => {
            window.location.href =
              locale === 'ar' ? '/payment/cancel' : '/en/payment/cancel';
          },
          onError: () => {
            setError(t('generalError'));
          },
        }).render(containerRef.current);
      } catch (err) {
        if (mounted) setError(t('loadError'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initPayPal();

    return () => {
      mounted = false;
    };
  }, [session, isPremium, locale, t, compact, paypalClientId]);

  if (paypalClientId === null) {
    return (
      <div className={`flex items-center justify-center gap-2 py-8 text-sm text-[var(--text-muted)] ${className}`}>
        <Loader2 size={18} className="animate-spin text-gold" />
        {t('loadingGateway')}
      </div>
    );
  }

  // --- PayPal not configured ---
  if (!paypalClientId) {
    return (
      <div className={`${compact ? '' : 'w-full max-w-md mx-auto'} ${className}`}>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-6">
          <Crown size={28} className="text-[var(--text-faint)]" />
          <p className="text-center text-sm text-[var(--text-muted)]">
            {locale === 'ar'
              ? 'الاشتراك غير متاح حالياً'
              : 'Subscription unavailable at this time'}
          </p>
        </div>
      </div>
    );
  }

  // --- Premium user: show badge ---
  if (isPremium) {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl border border-emerald/20 bg-emerald/5 px-5 py-4 ${className}`}
      >
        <Crown size={24} className="text-emerald" />
        <div>
          <p className="text-sm font-bold text-emerald">{t('premiumActive')}</p>
          <p className="text-xs text-[var(--text-muted)]">{t('premiumDesc')}</p>
        </div>
      </div>
    );
  }

  // --- Not logged in ---
  if (status !== 'authenticated') {
    return (
      <div className={className}>
        <Button
          className="btn-gold w-full cursor-pointer"
          onClick={() => {
            window.location.href =
              locale === 'ar' ? '/auth/signin' : '/en/auth/signin';
          }}
        >
          {t('signInToSubscribe')}
        </Button>
      </div>
    );
  }

  // --- Loading / Error / Activating states ---
  if (activating) {
    return (
      <div
        className={`flex items-center justify-center gap-3 py-6 ${className}`}
      >
        <Loader2 size={24} className="animate-spin text-gold" />
        <span className="text-sm text-[var(--text-muted)]">{t('activating')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p className="mb-3 text-center text-sm text-red-400">{error}</p>
        <Button
          className="btn-gold w-full cursor-pointer"
          onClick={() => window.location.reload()}
        >
          {t('retry')}
        </Button>
      </div>
    );
  }

  // --- PayPal button container ---
  return (
    <div className={`${compact ? '' : 'w-full max-w-md mx-auto'} ${className}`}>
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--text-muted)]">
          <Loader2 size={18} className="animate-spin text-gold" />
          {t('loadingGateway')}
        </div>
      )}
      <div
        ref={containerRef}
        className={loading ? 'invisible' : ''}
      />
      <p className="mt-3 text-center text-xs text-[var(--text-faint)]">
        {t('priceNote')}
      </p>
    </div>
  );
}

/**
 * Inline upgrade CTA for use in the app sidebar or paywall modal.
 */
export function UpgradeCta() {
  const locale = useLocale();
  const t = useTranslations('paypal');

  return (
    <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Crown size={20} className="text-gold" />
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          {t('upgradeTitle')}
        </h3>
      </div>
      <p className="mb-4 text-xs text-[var(--text-muted)]">
        {t('upgradeDesc')}
      </p>
      <PayPalSubscriptionButton compact />
    </div>
  );
}
