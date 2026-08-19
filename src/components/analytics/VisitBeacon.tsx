'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { readCookieConsent, type CookieConsent } from '@/lib/cookie-consent';

const VID_KEY = 'mq_vid';

function visitorKey(): string | null {
  try {
    const existing = window.localStorage.getItem(VID_KEY);
    if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(VID_KEY, next);
    return next;
  } catch {
    return null;
  }
}

function shouldSkip(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return p.includes('/admin') || p.startsWith('/api') || p.includes('/_next');
}

function ping(path: string, locale: string, key: string) {
  const stampKey = `mq_visit_at:${path}`;
  try {
    const last = Number(window.sessionStorage.getItem(stampKey) || '0');
    if (Date.now() - last < 5000) return;
    window.sessionStorage.setItem(stampKey, String(Date.now()));
  } catch {
    /* private mode */
  }

  void fetch('/api/analytics/visit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path, locale, visitorKey: key }),
    keepalive: true,
    credentials: 'same-origin',
  }).catch(() => undefined);
}

function allowedByConsent(): boolean {
  return readCookieConsent()?.analytics !== false;
}

/** First-party pageview beacon for Super Admin. Skips admin routes and explicit analytics opt-out. */
export function VisitBeacon({ locale }: { locale: string }) {
  const pathname = usePathname() || '/';

  useEffect(() => {
    if (shouldSkip(pathname)) return;

    const key = visitorKey();
    if (!key) return;

    let cancelled = false;
    const run = () => {
      if (cancelled || !allowedByConsent()) return;
      ping(pathname, locale === 'en' ? 'en' : 'ar', key);
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run);
    } else {
      timeoutId = setTimeout(run, 1200);
    }

    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent<CookieConsent>).detail;
      if (detail?.analytics === false) return;
      run();
    };
    window.addEventListener('mq-cookie-consent', onConsent as EventListener);

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
      window.removeEventListener('mq-cookie-consent', onConsent as EventListener);
    };
  }, [pathname, locale]);

  return null;
}
