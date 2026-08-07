'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';

type Props = {
  /** Optional override for back destination (defaults to browser back, fallback /jobs) */
  backHref?: string;
  backLabel?: { en: string; ar: string };
  /** Overlay chrome on full-bleed heroes */
  transparent?: boolean;
};

/**
 * Persistent chrome for every job-portal surface: Back + Home.
 */
export function JobPortalChrome({ backHref, backLabel, transparent }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const onBack = () => {
    if (backHref) {
      router.push(localePath(backHref, locale));
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(localePath('/jobs', locale));
  };

  return (
    <header
      className={`z-50 px-3 py-3 md:px-5 ${
        transparent
          ? 'absolute inset-x-0 top-0 border-b border-transparent bg-gradient-to-b from-[#05080f]/85 via-[#05080f]/40 to-transparent'
          : 'sticky top-0 border-b border-white/10 bg-[#070b14]/85 backdrop-blur-xl'
      }`}
    >
      <div className="mq-wrap flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 text-sm font-semibold text-white/85 transition hover:border-teal-300/35 hover:bg-white/[0.08] hover:text-white"
          >
            <BackIcon size={16} />
            <span className="hidden sm:inline">
              {backLabel
                ? isAr
                  ? backLabel.ar
                  : backLabel.en
                : isAr
                  ? 'رجوع'
                  : 'Back'}
            </span>
          </button>
          <Link
            href={localePath('/', locale)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 text-sm font-semibold text-white/85 transition hover:border-teal-300/35 hover:bg-white/[0.08] hover:text-white"
            aria-label={isAr ? 'الرئيسية' : 'Home'}
          >
            <Home size={16} />
            <span className="hidden sm:inline">{isAr ? 'الرئيسية' : 'Home'}</span>
          </Link>
        </div>

        <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="inline-flex">
          <BrandLogo size="nav" />
        </Link>

        <Link
          href={localePath('/jobs', locale)}
          className="inline-flex min-h-[44px] items-center rounded-xl border border-teal-300/25 bg-teal-400/10 px-3.5 text-sm font-bold text-teal-100 transition hover:border-teal-300/45 hover:bg-teal-400/15"
        >
          {isAr ? 'الوظائف' : 'Jobs'}
        </Link>
      </div>
    </header>
  );
}
