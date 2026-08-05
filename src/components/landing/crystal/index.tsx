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
    <div className="fixed top-4 right-4 z-[70]">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(16,35,58,0.12)] bg-white/90 px-3 py-2 text-[11px] font-bold tracking-wide text-[var(--mq-ink,#10233a)] shadow-sm backdrop-blur-md transition hover:border-[rgba(15,110,86,0.35)]"
        aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <span className={locale === 'en' ? 'text-[var(--mq-accent,#0f6e56)]' : 'text-[var(--mq-mute,#6b7c8f)]'}>
          EN
        </span>
        <span className="text-[var(--mq-mute,#6b7c8f)]">/</span>
        <span
          className={locale === 'ar' ? 'text-[var(--mq-accent,#0f6e56)]' : 'text-[var(--mq-mute,#6b7c8f)]'}
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
    <div className="mq-atelier relative min-h-screen overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'} lang={isAr ? 'ar' : 'en'}>
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
