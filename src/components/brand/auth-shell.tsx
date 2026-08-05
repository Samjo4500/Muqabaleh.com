'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  showBack?: boolean;
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-deep)] px-4 py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-teal-400/20 blur-[110px]" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-amber-300/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {showBack && (
          <button
            type="button"
            onClick={goBack}
            className="mb-4 flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <BackArrow size={16} strokeWidth={1.75} />
            {isAr ? 'رجوع' : 'Back'}
          </button>
        )}

        <div className="mb-8 flex flex-col items-center">
          <Link
            href={localePath('/', locale)}
            className="mb-5 inline-flex"
            aria-label={isAr ? 'الرئيسية' : 'Home'}
          >
            <BrandLogo size="nav" priority />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">{subtitle}</p>
          ) : null}
        </div>

        <div className={cn('glass-card rounded-2xl border border-white/10 p-4 md:p-6', className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
