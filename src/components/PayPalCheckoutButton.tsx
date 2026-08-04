'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, CheckCircle2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type PlanType = 'pro' | 'unlimited';

interface PayPalCheckoutButtonProps {
  plan: PlanType;
  className?: string;
}

/**
 * Unified PayPal checkout button.
 * - plan='pro'        → one-time $9.99 via PayPal Orders API
 * - plan='unlimited'  → recurring $29.99/mo via PayPal Subscriptions API
 */
export function PayPalCheckoutButton({ plan, className = '' }: PayPalCheckoutButtonProps) {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const t = useTranslations('paypal');
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const userTier = (session?.user as Record<string, unknown> | undefined)?.tier as string | undefined;
  const isCurrentPlan = (plan === 'pro' && userTier === 'PRO') || (plan === 'unlimited' && userTier === 'UNLIMITED');

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!paypalClientId || !session || isCurrentPlan) {
      setLoading(false);
      return;
    }
    let mounted = true;

    const initPayPal = async () => {
      try {
        const { loadScript } = await import('@paypal/paypal-js');

        const isSubscription = plan === 'unlimited';

        const paypal = await loadScript({
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
          vault: isSubscription,
          intent: isSubscription ? 'subscription' : 'capture',
          locale: locale === 'ar' ? 'ar_SA' : 'en_US',
          currency: 'USD',
        });

        if (!mounted || !paypal || !paypal.Buttons || !containerRef.current) return;

        const callbacks: Record<string, (...args: any[]) => Promise<void> | Promise<string>> = {};

        if (isSubscription) {
          // ── UNLIMITED: Subscription flow ──
          callbacks.createSubscription = async () => {
            const res = await fetch('/api/paypal/create-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            const data = (await res.json()) as {
              subscriptionId?: string;
              error?: string;
            };
            if (!res.ok || data.error) {
              setError(data.error || t('createError'));
              throw new Error(data.error || 'Create subscription failed');
            }
            return data.subscriptionId || '';
          };
          callbacks.onApprove = async (data: { subscriptionID?: string }) => {
            setProcessing(true);
            try {
              const res = await fetch('/api/paypal/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId: data.subscriptionID || '' }),
              });
              if (res.ok) {
                window.location.href = `/${locale}/payment/success`;
              } else {
                setError(t('activateError'));
              }
            } catch {
              setError(t('activateError'));
            } finally {
              setProcessing(false);
            }
          };
        } else {
          // ── PRO: One-time order flow ──
          callbacks.createOrder = async () => {
            const res = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ plan: 'pro' }),
            });
            const data = (await res.json()) as {
              orderId?: string;
              error?: string;
            };
            if (!res.ok || data.error) {
              setError(data.error || t('createError'));
              throw new Error(data.error || 'Create order failed');
            }
            return data.orderId || '';
          };
          callbacks.onApprove = async (data: { orderID?: string }) => {
            setProcessing(true);
            try {
              const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID || '' }),
              });
              if (res.ok) {
                window.location.href = `/${locale}/payment/success`;
              } else {
                setError(t('activateError'));
              }
            } catch {
              setError(t('activateError'));
            } finally {
              setProcessing(false);
            }
          };
        }

        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: isSubscription ? 'subscribe' : 'pay',
            height: 44,
          },
          onCancel: () => {
            window.location.href = `/${locale}/payment/cancel`;
          },
          onError: () => {
            setError(t('generalError'));
          },
          ...callbacks,
        } as any).render(containerRef.current);
      } catch (err) {
        if (mounted) setError(t('loadError'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initPayPal();
    return () => { mounted = false; };
  }, [session, isCurrentPlan, locale, t, plan, paypalClientId]);

  // --- PayPal not configured ---
  if (!paypalClientId) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-6">
          <Crown size={28} className="text-[var(--text-faint)]" />
          <p className="text-center text-sm text-[var(--text-muted)]">
            {locale === 'ar'
              ? 'الدفع غير متاح حالياً'
              : 'Payment unavailable at this time'}
          </p>
        </div>
      </div>
    );
  }

  // --- Already on this plan ---
  if (isCurrentPlan) {
    return (
      <div className={`flex items-center gap-3 rounded-xl border border-emerald/20 bg-emerald/5 px-5 py-4 ${className}`}>
        <CheckCircle2 size={24} className="text-emerald" />
        <div>
          <p className="text-sm font-bold text-emerald">{t('planActive')}</p>
          <p className="text-xs text-[var(--text-muted)]">{t('planActiveDesc')}</p>
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
            window.location.href = `/${locale}/auth/signin`;
          }}
        >
          {t('signInToSubscribe')}
        </Button>
      </div>
    );
  }

  // --- Processing ---
  if (processing) {
    return (
      <div className={`flex items-center justify-center gap-3 py-6 ${className}`}>
        <Loader2 size={24} className="animate-spin text-gold" />
        <span className="text-sm text-[var(--text-muted)]">{t('activating')}</span>
      </div>
    );
  }

  // --- Error ---
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
  const priceNote = plan === 'unlimited'
    ? t('priceNoteUnlimited')
    : t('priceNotePro');

  return (
    <div className={className}>
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
        {priceNote}
      </p>
    </div>
  );
}
