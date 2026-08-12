'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import {
  hasAnalyticsConsent,
  readCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';
import { getGaId } from '@/lib/analytics-ga';

/**
 * Loads GA4 (and optional Meta Pixel) only after analytics consent.
 * Vercel Analytics stays separate (first-party, no cookies required).
 */
export function ConditionalAnalytics() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const gaId = getGaId();
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';

  useEffect(() => {
    setConsent(readCookieConsent());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<CookieConsent>).detail;
      setConsent(detail || readCookieConsent());
    };
    window.addEventListener('mq-cookie-consent', onChange as EventListener);
    return () =>
      window.removeEventListener('mq-cookie-consent', onChange as EventListener);
  }, []);

  const analyticsAllowed = consent?.analytics === true || hasAnalyticsConsent();
  if (!analyticsAllowed || !gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="mq-ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
      {metaPixelId ? (
        <Script id="mq-meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}
    </>
  );
}
