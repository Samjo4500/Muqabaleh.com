'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';

/** Shared top chrome: logo → home, optional back, optional trailing slot. */
export function AppChromeHeader({
  trailing,
  showBack = true,
  maxWidthClass = 'max-w-3xl',
}: {
  trailing?: React.ReactNode;
  showBack?: boolean;
  maxWidthClass?: string;
}) {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const goHome = () => router.push(localePath('/', locale));
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    goHome();
  };

  return (
    <header className="relative z-20 px-4 pt-4 md:px-6">
      <div
        className={`glass mx-auto flex h-16 items-center justify-between gap-3 rounded-2xl px-3 sm:px-4 ${maxWidthClass}`}
      >
        <Link
          href={localePath('/', locale)}
          className="inline-flex min-w-0 items-center rounded-xl py-1 pe-2 transition hover:bg-white/[0.04]"
          aria-label={isAr ? 'الرئيسية' : 'Home'}
        >
          <BrandLogo size="nav" priority />
        </Link>
        <div className="flex items-center gap-2">
          {trailing}
          {showBack ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/[0.04]"
            >
              <BackIcon className="h-4 w-4" />
              {isAr ? 'رجوع' : 'Back'}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
