'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function post(body: Record<string, unknown>) {
  const payload = JSON.stringify(body);
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon('/api/visitors/collect', blob);
    return;
  }
  void fetch('/api/visitors/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

/**
 * First-party visitor beacon. Same-origin, no third party, not gated on ad cookies.
 * Pageviews + 15s heartbeats power the Super Admin visitors dashboard.
 */
export function VisitorTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const lastPath = useRef<string>('');

  useEffect(() => {
    const path = pathname || '/';
    const locale = path.startsWith('/en') ? 'en' : 'ar';
    const searchStr = search?.toString() ? `?${search.toString()}` : '';
    if (lastPath.current !== path) {
      lastPath.current = path;
      post({
        type: 'pageview',
        path,
        title: typeof document !== 'undefined' ? document.title : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        search: searchStr,
        locale,
      });
    }

    const beat = () =>
      post({
        type: 'heartbeat',
        path,
        title: typeof document !== 'undefined' ? document.title : '',
        locale,
      });

    const interval = window.setInterval(beat, 15_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') beat();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [pathname, search]);

  return null;
}
