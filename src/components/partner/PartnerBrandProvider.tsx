'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PartnerRecord } from '@/lib/partner/types';

type BrandContextValue = {
  partner: PartnerRecord | null;
  loading: boolean;
};

const PartnerBrandContext = createContext<BrandContextValue>({
  partner: null,
  loading: true,
});

export function usePartnerBrand() {
  return useContext(PartnerBrandContext);
}

/**
 * Loads white-label partner branding from host (x-partner-host / resolve API)
 * and applies CSS variables for candidate interview UX.
 */
export function PartnerBrandProvider({
  children,
  hostHint,
}: {
  children: ReactNode;
  hostHint?: string | null;
}) {
  const [partner, setPartner] = useState<PartnerRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const host =
          hostHint ||
          (typeof window !== 'undefined' ? window.location.hostname : '');
        const qs = host ? `?host=${encodeURIComponent(host)}` : '';
        const res = await fetch(`/api/partner/resolve${qs}`);
        const data = (await res.json()) as { partner?: PartnerRecord | null };
        if (cancelled) return;
        setPartner(data.partner || null);
      } catch {
        if (!cancelled) setPartner(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hostHint]);

  useEffect(() => {
    if (!partner) return;
    const root = document.documentElement;
    root.style.setProperty('--wl-primary', partner.primaryColor || '#14B8A6');
    root.style.setProperty('--wl-accent', partner.accentColor || '#D4A843');
    root.dataset.partnerBrand = partner.slug;
    return () => {
      delete root.dataset.partnerBrand;
    };
  }, [partner]);

  const value = useMemo(() => ({ partner, loading }), [partner, loading]);
  return (
    <PartnerBrandContext.Provider value={value}>{children}</PartnerBrandContext.Provider>
  );
}

/** Compact brand chrome for interview flows when a partner host is active. */
export function PartnerInterviewChrome() {
  const { partner, loading } = usePartnerBrand();
  if (loading || !partner) return null;
  return (
    <div
      className="wl-chrome mb-2 flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3"
      style={{
        background: `linear-gradient(135deg, ${partner.primaryColor}22, transparent 70%)`,
      }}
    >
      {partner.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.logoUrl}
          alt={partner.name}
          className="h-9 w-9 rounded-lg object-contain bg-white/10 p-1"
        />
      ) : (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-slate-950"
          style={{ background: partner.primaryColor }}
        >
          {partner.name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{partner.name}</p>
        <p className="truncate text-xs text-white/50">
          {partner.customDomain || `${partner.slug}.muqabaleh.com`}
        </p>
      </div>
    </div>
  );
}
