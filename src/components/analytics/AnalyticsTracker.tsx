'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const VISITOR_KEY = 'mq_vid';
const SESSION_KEY = 'mq_sid';
const SESSION_TS_KEY = 'mq_sid_ts';
const OPT_OUT_KEY = 'mq_analytics_opt_out';
const SESSION_TTL_MS = 30 * 60 * 1000;

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

function getSessionId(): string {
  try {
    const now = Date.now();
    const ts = Number(sessionStorage.getItem(SESSION_TS_KEY) || 0);
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id || !ts || now - ts > SESSION_TTL_MS) {
      id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    sessionStorage.setItem(SESSION_TS_KEY, String(now));
    return id;
  } catch {
    return uuid();
  }
}

function utmFromSearch(search: string) {
  const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return {
    utmSource: sp.get('utm_source'),
    utmMedium: sp.get('utm_medium'),
    utmCampaign: sp.get('utm_campaign'),
    utmTerm: sp.get('utm_term'),
    utmContent: sp.get('utm_content'),
    gclid: sp.get('gclid'),
    fbclid: sp.get('fbclid'),
  };
}

function connectionType(): string | null {
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string };
  };
  return nav.connection?.effectiveType || null;
}

type Payload = Record<string, unknown>;

function send(events: Payload[]) {
  try {
    if (localStorage.getItem(OPT_OUT_KEY) === '1') return;
  } catch {
    /* ignore */
  }
  const body = JSON.stringify({ events });
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const ok = navigator.sendBeacon(
      '/api/analytics/collect',
      new Blob([body], { type: 'application/json' }),
    );
    if (ok) return;
  }
  void fetch('/api/analytics/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
    credentials: 'same-origin',
  }).catch(() => null);
}

function scrollPercent(): number {
  const el = document.documentElement;
  const scrollTop = window.scrollY || el.scrollTop;
  const height = el.scrollHeight - el.clientHeight;
  if (height <= 0) return 100;
  return Math.min(100, Math.round((scrollTop / height) * 100));
}

/**
 * First-party page visitor tracker — pageviews, scroll depth, outbound clicks,
 * engagement duration, exit. Mount once in the locale layout.
 */
export function AnalyticsTracker() {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  const prevPathRef = useRef<string | null>(null);
  const pageStartedRef = useRef<number>(Date.now());
  const maxScrollRef = useRef(0);
  const sentScrollRef = useRef<Set<number>>(new Set());
  const visitorRef = useRef('');
  const sessionRef = useRef('');

  useEffect(() => {
    visitorRef.current = getVisitorId();
    sessionRef.current = getSessionId();
  }, []);

  // Pageview on route / query change
  useEffect(() => {
    visitorRef.current = getVisitorId();
    sessionRef.current = getSessionId();
    pageStartedRef.current = Date.now();
    maxScrollRef.current = 0;
    sentScrollRef.current = new Set();

    const utm = utmFromSearch(search);
    const previousPath = prevPathRef.current;
    prevPathRef.current = pathname + search;

    send([
      {
        type: 'pageview',
        visitorId: visitorRef.current,
        sessionId: sessionRef.current,
        path: pathname,
        query: search.replace(/^\?/, '') || null,
        hash: typeof window !== 'undefined' ? window.location.hash || null : null,
        locale: pathname.startsWith('/en') ? 'en' : 'ar',
        title: typeof document !== 'undefined' ? document.title : null,
        referrer: typeof document !== 'undefined' ? document.referrer || null : null,
        previousPath,
        screenW: window.screen?.width,
        screenH: window.screen?.height,
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        connection: connectionType(),
        entryUrl: window.location.href,
        ...utm,
        occurredAt: new Date().toISOString(),
      },
    ]);
  }, [pathname, search]);

  // Scroll milestones + engage heartbeat + outbound clicks + exit
  useEffect(() => {
    const onScroll = () => {
      const pct = scrollPercent();
      if (pct > maxScrollRef.current) maxScrollRef.current = pct;
      for (const milestone of [25, 50, 75, 90, 100]) {
        if (pct >= milestone && !sentScrollRef.current.has(milestone)) {
          sentScrollRef.current.add(milestone);
          send([
            {
              type: 'scroll',
              visitorId: visitorRef.current || getVisitorId(),
              sessionId: sessionRef.current || getSessionId(),
              path: pathname,
              query: search.replace(/^\?/, '') || null,
              scrollPct: milestone,
              durationMs: Date.now() - pageStartedRef.current,
              viewportW: window.innerWidth,
              viewportH: window.innerHeight,
              occurredAt: new Date().toISOString(),
            },
          ]);
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a') as HTMLAnchorElement | null;
      if (!a?.href) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.origin);
      } catch {
        return;
      }
      const isOutbound = url.origin !== window.location.origin;
      if (!isOutbound && !a.dataset.trackClick) return;
      send([
        {
          type: isOutbound ? 'outbound' : 'click',
          visitorId: visitorRef.current || getVisitorId(),
          sessionId: sessionRef.current || getSessionId(),
          path: pathname,
          clickHref: url.href,
          clickText: (a.textContent || '').trim().slice(0, 120) || null,
          durationMs: Date.now() - pageStartedRef.current,
          scrollPct: maxScrollRef.current,
          occurredAt: new Date().toISOString(),
        },
      ]);
    };

    const flushExit = () => {
      send([
        {
          type: 'exit',
          visitorId: visitorRef.current || getVisitorId(),
          sessionId: sessionRef.current || getSessionId(),
          path: pathname,
          query: search.replace(/^\?/, '') || null,
          durationMs: Date.now() - pageStartedRef.current,
          scrollPct: maxScrollRef.current,
          occurredAt: new Date().toISOString(),
        },
      ]);
    };

    const engage = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      send([
        {
          type: 'engage',
          visitorId: visitorRef.current || getVisitorId(),
          sessionId: sessionRef.current || getSessionId(),
          path: pathname,
          durationMs: Date.now() - pageStartedRef.current,
          scrollPct: maxScrollRef.current,
          occurredAt: new Date().toISOString(),
        },
      ]);
    }, 15_000);

    const onError = (event: ErrorEvent) => {
      send([
        {
          type: 'error',
          visitorId: visitorRef.current || getVisitorId(),
          sessionId: sessionRef.current || getSessionId(),
          path: pathname,
          meta: {
            message: String(event.message || '').slice(0, 300),
            source: String(event.filename || '').slice(0, 300),
            line: event.lineno,
            col: event.colno,
          },
          occurredAt: new Date().toISOString(),
        },
      ]);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick, true);
    window.addEventListener('pagehide', flushExit);
    window.addEventListener('beforeunload', flushExit);
    window.addEventListener('error', onError);

    return () => {
      window.clearInterval(engage);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('pagehide', flushExit);
      window.removeEventListener('beforeunload', flushExit);
      window.removeEventListener('error', onError);
      flushExit();
    };
  }, [pathname, search]);

  return null;
}
