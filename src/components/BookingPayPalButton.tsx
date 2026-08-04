'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, AlertCircle } from 'lucide-react';

interface BookingPayPalButtonProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onError: (err: string) => void;
}

export function BookingPayPalButton({
  bookingId,
  amount,
  onSuccess,
  onError,
}: BookingPayPalButtonProps) {
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!paypalClientId) {
      setLoading(false);
      return;
    }
    let mounted = true;

    const initPayPal = async () => {
      try {
        const { loadScript } = await import('@paypal/paypal-js');

        const paypal = await loadScript({
          'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
          intent: 'capture',
          currency: 'USD',
          locale: locale === 'ar' ? 'ar_SA' : 'en_US',
        } as any);

        if (!mounted || !paypal || !paypal.Buttons || !containerRef.current) return;

        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'pay',
            height: 48,
          },
          createOrder: async () => {
            const res = await fetch('/api/paypal/create-booking-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId }),
            });
            const data = (await res.json()) as {
              orderId?: string;
              error?: { en?: string; ar?: string };
            };

            if (!res.ok || data.error) {
              const msg = data.error?.en || 'Failed to create payment order';
              setError(msg);
              onError(msg);
              throw new Error(msg);
            }
            return data.orderId || '';
          },
          onApprove: async (data) => {
            setCapturing(true);
            try {
              const res = await fetch('/api/paypal/capture-booking-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  bookingId,
                  orderId: data.orderID || '',
                }),
              });

              const result = (await res.json()) as {
                success?: boolean;
                error?: { en?: string; ar?: string };
              };

              if (res.ok && result.success) {
                onSuccess();
              } else {
                const msg = result.error?.en || 'Payment capture failed';
                setError(msg);
                onError(msg);
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Payment failed';
              setError(msg);
              onError(msg);
            } finally {
              setCapturing(false);
            }
          },
          onError: () => {
            const msg = locale === 'ar'
              ? 'حدث خطأ في الدفع'
              : 'An error occurred with the payment';
            setError(msg);
            onError(msg);
          },
        }).render(containerRef.current);
      } catch (err) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load payment gateway';
          setError(msg);
          onError(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initPayPal();

    return () => {
      mounted = false;
    };
  }, [bookingId, amount, locale, onSuccess, onError]);

  // --- PayPal not configured ---
  if (!paypalClientId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-6">
        <AlertCircle size={28} className="text-[var(--text-faint)]" />
        <p className="text-center text-sm text-[var(--text-muted)]">
          {locale === 'ar'
            ? 'الدفع غير متاح حالياً'
            : 'Payment unavailable at this time'}
        </p>
      </div>
    );
  }

  // --- Capturing state ---
  if (capturing) {
    return (
      <div className="flex items-center justify-center gap-3 py-6">
        <Loader2 size={24} className="animate-spin text-[var(--gold)]" />
        <span className="text-sm text-[var(--text-muted)]">
          {locale === 'ar' ? 'جارٍ تأكيد الدفع...' : 'Confirming payment...'}
        </span>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div>
        <p className="mb-3 text-center text-sm text-red-400">{error}</p>
        <button
          className="btn-gold w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-black"
          onClick={() => window.location.reload()}
        >
          {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  // --- PayPal button container ---
  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--text-muted)]">
          <Loader2 size={18} className="animate-spin text-[var(--gold)]" />
          {locale === 'ar' ? 'جارٍ تحميل بوابة الدفع...' : 'Loading payment gateway...'}
        </div>
      )}
      <div ref={containerRef} className={loading ? 'invisible' : ''} />
      <p className="mt-3 text-center text-xs text-[var(--text-faint)]">
        ${amount.toFixed(2)} USD
      </p>
    </div>
  );
}
