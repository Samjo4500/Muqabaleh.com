'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { getLocaleSwitchPath, localePath } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  showBack?: boolean;
}

function LanguageSwitcherFixed() {
  const locale = useLocale();
  const pathname = usePathname() || '/';
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  const href = getLocaleSwitchPath(pathname, locale, nextLocale);

  return (
    <div className="fixed top-4 right-4 z-[70]">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-[11px] font-bold tracking-wide text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-teal-300/40 hover:bg-white/12"
        aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <span className={locale === 'en' ? 'text-teal-300' : 'text-white/45'}>EN</span>
        <span className="text-white/35">/</span>
        <span className={locale === 'ar' ? 'text-teal-300' : 'text-white/45'} dir="rtl" lang="ar">
          عربي
        </span>
      </a>
    </div>
  );
}

export function AuthShell({
  children,
  title,
  subtitle,
  className,
  showBack = false,
}: AuthShellProps) {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const goHome = () => router.push(localePath('/', locale));
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    goHome();
  };

  return (
    <div
      className="mq-atelier relative flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-12"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
        <div className="mq-orb mq-orb-c" />
      </div>

      <LanguageSwitcherFixed />

      <div className="relative z-10 w-full max-w-md">
        {showBack ? (
          <button
            type="button"
            onClick={goBack}
            className="mb-4 flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-teal-300"
          >
            <BackArrow size={16} strokeWidth={1.75} />
            {isAr ? 'رجوع' : 'Back'}
          </button>
        ) : null}

        <div className="mb-8 flex flex-col items-center">
          <Link
            href={localePath('/', locale)}
            className="mb-5 inline-flex"
            aria-label={isAr ? 'الرئيسية' : 'Home'}
          >
            <BrandLogo size="md" priority className="mq-logo-glow" />
          </Link>
          <h1 className="mq-display text-center text-2xl font-bold text-white md:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-center text-sm text-white/55">{subtitle}</p>
          ) : null}
        </div>

        <div
          className={cn(
            'rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-7',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
