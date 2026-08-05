'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { AppChromeHeader } from '@/components/chrome/AppChromeHeader';

/**
 * Lightweight atelier chrome for product flows (demo, prequal, session, report).
 * Logo + back — no marketing navbar/footer.
 */
export function AtelierFlowShell({
  children,
  trailing,
  showBack = true,
  maxWidthClass = 'max-w-3xl',
  className = '',
}: {
  children: ReactNode;
  trailing?: ReactNode;
  showBack?: boolean;
  maxWidthClass?: string;
  className?: string;
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div
      className={`mq-atelier relative flex min-h-screen flex-col overflow-x-hidden ${className}`}
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
        <div className="mq-orb mq-orb-c" />
      </div>

      <AppChromeHeader trailing={trailing} showBack={showBack} maxWidthClass={maxWidthClass} />

      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
