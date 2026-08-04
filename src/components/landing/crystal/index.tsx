'use client';

import { OrganizationJsonLd, ProductJsonLd } from '@/components/json-ld';
import { CrystalNavbar } from './CrystalNavbar';
import { CrystalHero } from './Hero';
import { CrystalB2C } from './B2C';
import { CrystalB2B } from './B2B';
import { CrystalSocialProof } from './SocialProof';
import { CrystalPricing } from './Pricing';
import { CrystalHowItWorks } from './HowItWorks';
import { CrystalFinalCta } from './FinalCta';
import { CrystalFooter } from './CrystalFooter';

export function CrystalLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <OrganizationJsonLd />
      <ProductJsonLd />
      <CrystalNavbar />
      <main className="flex-1">
        <CrystalHero />
        <CrystalB2C />
        <CrystalB2B />
        <CrystalSocialProof />
        <CrystalPricing />
        <CrystalHowItWorks />
        <CrystalFinalCta />
      </main>
      <CrystalFooter />
    </div>
  );
}
