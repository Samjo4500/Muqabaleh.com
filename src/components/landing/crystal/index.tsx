'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { getLocaleSwitchPath } from '@/i18n/navigation';
import { CrystalNavbar } from './CrystalNavbar';
import { CrystalHero } from './Hero';
import { CrystalTrust } from './Trust';
import { CrystalServices } from './Services';
import { CrystalHowItWorks } from './HowItWorks';
import { CrystalForCompanies } from './ForCompanies';
import { CrystalPricing } from './Pricing';
import { CrystalTestimonials } from './Testimonials';
import { CrystalFAQ } from './FAQ';
import { CrystalFinalCta } from './FinalCta';
import { CrystalFooter } from './CrystalFooter';

function LanguageSwitcherFixed() {
  const locale = useLocale();
  const pathname = usePathname() || '/';
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  const href = getLocaleSwitchPath(pathname, locale, nextLocale);

  return (
    <div className="fixed top-3 end-3 z-[60] sm:top-4 sm:end-4">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[var(--bg-deep)]/80 px-3 py-1.5 text-[11px] font-bold tracking-wide text-[var(--text-primary)] shadow-lg backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-[var(--bg-deep)]/95"
        aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <span className={locale === 'en' ? 'text-cyan-300' : 'text-[var(--text-muted)]'}>EN</span>
        <span className="text-[var(--text-muted)]">/</span>
        <span
          className={locale === 'ar' ? 'text-cyan-300' : 'text-[var(--text-muted)]'}
          dir="rtl"
          lang="ar"
        >
          عربي
        </span>
      </a>
    </div>
  );
}

export function CrystalLanding() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[var(--bg-deep)] text-[var(--text-primary)]"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <LanguageSwitcherFixed />
      <CrystalNavbar />
      <main>
        <CrystalHero />
        <CrystalTrust />
        <CrystalServices />
        <CrystalHowItWorks />
        <CrystalForCompanies />
        <CrystalPricing />
        <CrystalTestimonials />
        <CrystalFAQ />
        <CrystalFinalCta />
      </main>
      <CrystalFooter />
    </div>
  );
}
