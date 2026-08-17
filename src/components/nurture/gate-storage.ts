import { STORAGE_KEY } from '@/lib/nurture/constants';

export type StoredNurture = {
  email?: string;
  fullName?: string;
  currentCity?: string;
  company?: string;
  phone?: string;
  yearsExperience?: string;
  preferredLanguage?: string;
  unlocked?: boolean;
  practiceReady?: boolean;
  token?: string;
};

export function readNurture(): StoredNurture {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredNurture;
  } catch {
    return {};
  }
}

export function writeNurture(patch: StoredNurture): StoredNurture {
  const next = { ...readNurture(), ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function collectNurture(kind: string, extra?: Record<string, string | undefined>) {
  const stored = readNurture();
  void fetch('/api/nurture/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind,
      email: stored.email,
      token: stored.token,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      ...extra,
    }),
    keepalive: true,
  }).catch(() => undefined);
}
