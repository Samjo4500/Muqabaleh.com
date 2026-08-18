import { getLocale } from 'next-intl/server';
import { CrystalNavbar } from './CrystalNavbar';
import { CrystalHero } from './Hero';
import { CrystalSimplePath } from './SimplePath';
import { CrystalFAQ } from './FAQ';
import { PopularGuides } from './PopularGuides';
import { BelowFoldStatic } from './BelowFoldStatic';
import { BelowFoldLoader } from './BelowFoldLoader';
import { HomeLanguageSwitch } from './HomeLanguageSwitch';
import { HomeFooter } from './HomeFooter';

/**
 * Prepare-and-Verify landing — server shell.
 * Cinematic below-fold islands load only when scrolled near view.
 */
export async function CrystalLanding() {
  const locale = await getLocale();
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

      <HomeLanguageSwitch locale={locale} />
      <CrystalNavbar locale={locale} />
      <main>
        <CrystalHero locale={locale} />
        <CrystalSimplePath locale={locale} />
        <PopularGuides locale={locale} />
        <BelowFoldLoader
          faq={<CrystalFAQ locale={locale} />}
          fallback={<BelowFoldStatic locale={locale} />}
        />
      </main>
      <HomeFooter locale={locale} />
    </div>
  );
}
