'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { getLocaleSwitchPath } from '@/i18n/navigation';
import { ArabesqueBackdrop, ArabesqueCorners } from './ArabesqueBackdrop';
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

export function CrystalLanding() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="mq-atelier" dir={isAr ? 'rtl' : 'ltr'} lang={isAr ? 'ar' : 'en'}>
      {/* viewport-fixed ornaments — outside overflow clipping */}
      <ArabesqueCorners />

      <div className="relative min-h-screen overflow-x-hidden">
        <ArabesqueBackdrop />

        <div className="relative z-10">
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
      </div>
    </div>
  );
}
