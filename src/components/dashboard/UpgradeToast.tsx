'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { trackGaEvent } from '@/lib/analytics-ga';

/** Shows success toast when redirected after PayPal upgrade (?upgraded=true). */
export function UpgradeToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const isAr = locale === 'ar';

  useEffect(() => {
    const upgraded = searchParams.get('upgraded');
    if (upgraded !== 'true' && upgraded !== '1') return;
    toast.success(isAr ? 'تم الترقية بنجاح!' : 'Upgraded successfully!');
    trackGaEvent('payment_completed', { source: 'paypal' });
    const params = new URLSearchParams(searchParams.toString());
    params.delete('upgraded');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, router, pathname, isAr]);

  return null;
}
