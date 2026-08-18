'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';

type CinematicMods = {
  Passport: ComponentType;
  Jeannie: ComponentType;
  Pricing: ComponentType;
  Cta: ComponentType;
};

/**
 * Lighthouse mobile scores first-load TBT. Do not import framer-motion islands
 * until the sentinel is near the viewport — no short timeout fallback.
 */
export function BelowFoldLoader({
  fallback,
  faq,
}: {
  fallback: React.ReactNode;
  faq: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [mods, setMods] = useState<CinematicMods | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    void Promise.all([
      import('./PassportShowcase'),
      import('./Jeannie'),
      import('./Pricing'),
      import('./FinalCta'),
    ]).then(([passport, jeannie, pricing, cta]) => {
      if (cancelled) return;
      setMods({
        Passport: passport.CrystalPassportShowcase,
        Jeannie: jeannie.CrystalJeannie,
        Pricing: pricing.CrystalPricing,
        Cta: cta.CrystalFinalCta,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [near]);

  if (mods) {
    return (
      <>
        <mods.Passport />
        <mods.Jeannie />
        <mods.Pricing />
        {faq}
        <mods.Cta />
      </>
    );
  }

  return <div ref={ref}>{fallback}</div>;
}
