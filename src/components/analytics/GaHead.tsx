import { isValidGaMeasurementId } from '@/lib/analytics-funnel';

/**
 * Server-rendered GA4 snippet in <head> on every locale route.
 * Consent Mode defaults to denied; ConditionalAnalytics grants after cookie accept.
 */
export function GaHead() {
  const raw = process.env.NEXT_PUBLIC_GA_ID?.trim() || '';
  const gaId = isValidGaMeasurementId(raw) ? raw : null;
  if (!gaId) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <script
        id="mq-ga4-head"
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true, send_page_view: true });
          `.trim(),
        }}
      />
    </>
  );
}
