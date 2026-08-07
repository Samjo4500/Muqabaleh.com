import dynamic from 'next/dynamic';
import { getLocale } from 'next-intl/server';
import { CrystalNavbar } from './CrystalNavbar';
import { CrystalHero } from './Hero';
import { LanguageSwitcherFixed } from '@/components/chrome/LanguageSwitcherFixed';

const CrystalSimplePath = dynamic(
  () => import('./SimplePath').then((m) => m.CrystalSimplePath),
  { ssr: true },
);
const CrystalPassportShowcase = dynamic(
  () => import('./PassportShowcase').then((m) => m.CrystalPassportShowcase),
  { ssr: true },
);
const CrystalJeannie = dynamic(
  () => import('./Jeannie').then((m) => m.CrystalJeannie),
  { ssr: true },
);
const CrystalPricing = dynamic(
  () => import('./Pricing').then((m) => m.CrystalPricing),
  { ssr: true },
);
const CrystalFAQ = dynamic(
  () => import('./FAQ').then((m) => m.CrystalFAQ),
  { ssr: true },
);
const CrystalFinalCta = dynamic(
  () => import('./FinalCta').then((m) => m.CrystalFinalCta),
  { ssr: true },
);
const CrystalFooter = dynamic(
  () => import('./CrystalFooter').then((m) => m.CrystalFooter),
  { ssr: true },
);

/**
 * Prepare-and-Verify landing — server shell, client islands below the fold.
 * Hero → path → passport → Jeannie → pricing → FAQ → CTA.
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

      <LanguageSwitcherFixed />
      <CrystalNavbar />
      <main>
        <CrystalHero />
        <CrystalSimplePath />
        <CrystalPassportShowcase />
        <CrystalJeannie />
        <CrystalPricing />
        <CrystalFAQ />
        <CrystalFinalCta />
      </main>
      <CrystalFooter />
    </div>
  );
}
