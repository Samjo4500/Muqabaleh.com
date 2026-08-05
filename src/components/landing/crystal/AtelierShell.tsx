'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { getLocaleSwitchPath, localePath } from '@/i18n/navigation';
import { BrandLogo } from './BrandLogo';
import { CrystalNavbar } from './CrystalNavbar';
import { CrystalFooter } from './CrystalFooter';

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

export function AtelierShell({
  children,
  showHeroLogo = false,
}: {
  children: ReactNode;
  showHeroLogo?: boolean;
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div
      className="mq-atelier relative min-h-screen overflow-x-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
        <div className="mq-orb mq-orb-c" />
      </div>

      <LanguageSwitcherFixed />
      <CrystalNavbar />

      {showHeroLogo ? (
        <div className="mq-wrap relative pt-8 md:pt-10">
          <div className="flex justify-center">
            <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="inline-flex">
              <BrandLogo size="hero" priority className="mq-logo-glow" />
            </Link>
          </div>
        </div>
      ) : null}

      <main className="relative z-10">{children}</main>
      <CrystalFooter />
    </div>
  );
}
