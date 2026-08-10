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
        className={`mx-auto flex h-[76px] items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/[0.06] px-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-4 md:h-[84px] ${maxWidthClass}`}
      >
        <Link
          href={localePath('/', locale)}
          className="inline-flex min-w-0 items-center rounded-xl py-1 pe-2 transition hover:bg-white/[0.06]"
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
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/60 transition hover:bg-white/[0.06] hover:text-teal-300"
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
