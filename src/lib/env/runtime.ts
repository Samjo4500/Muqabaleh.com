/**
 * Runtime env normalization for Muqabaleh.
 * Safe to call multiple times (idempotent). Never logs secret values.
 */

const PRODUCTION_APP_URL = 'https://muqabaleh.com';

/** Prefer BREVO_API_KEY; accept BREVO_KEY as alias (Cursor / legacy). */
export function getBrevoApiKey(): string | null {
  const primary = process.env.BREVO_API_KEY?.trim();
  if (primary) return primary;
  const alias = process.env.BREVO_KEY?.trim();
  return alias || null;
}

export function hasBrevoApiKey(): boolean {
  return Boolean(getBrevoApiKey());
}

/** NextAuth secret — Auth.js v4/v5 naming. */
export function getNextAuthSecret(): string | null {
  const v =
    process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  return v || null;
}

/**
 * Canonical site URL for NextAuth cookies / callbacks.
 * Empty-string Vercel vars are treated as unset.
 */
export function resolveNextAuthUrl(): {
  url: string | null;
  source: 'NEXTAUTH_URL' | 'AUTH_URL' | 'NEXT_PUBLIC_APP_URL' | 'production_default' | 'VERCEL_URL' | 'none';
} {
  const nextAuth = process.env.NEXTAUTH_URL?.trim();
  if (nextAuth) return { url: nextAuth.replace(/\/$/, ''), source: 'NEXTAUTH_URL' };

  const authUrl = process.env.AUTH_URL?.trim();
  if (authUrl) return { url: authUrl.replace(/\/$/, ''), source: 'AUTH_URL' };

  const publicApp = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (publicApp) {
    return { url: publicApp.replace(/\/$/, ''), source: 'NEXT_PUBLIC_APP_URL' };
  }

  if (process.env.VERCEL_ENV === 'production') {
    return { url: PRODUCTION_APP_URL, source: 'production_default' };
  }

  if (process.env.VERCEL_URL?.trim()) {
    return {
      url: `https://${process.env.VERCEL_URL.trim()}`,
      source: 'VERCEL_URL',
    };
  }

  return { url: null, source: 'none' };
}

/**
 * Fill empty critical env aliases so the rest of the app sees them.
 * Call from instrumentation (Node) and auth route.
 */
export function applyRuntimeEnvDefaults(): void {
  if (!process.env.BREVO_API_KEY?.trim() && process.env.BREVO_KEY?.trim()) {
    process.env.BREVO_API_KEY = process.env.BREVO_KEY.trim();
  }

  if (!process.env.NEXTAUTH_SECRET?.trim() && process.env.AUTH_SECRET?.trim()) {
    process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET.trim();
  }

  if (!process.env.NEXTAUTH_URL?.trim()) {
    const { url } = resolveNextAuthUrl();
    if (url) process.env.NEXTAUTH_URL = url;
  }

  // Preview: prefer the deployment host so cookies match the preview URL.
  if (
    process.env.VERCEL_ENV === 'preview' &&
    process.env.VERCEL_URL &&
    !process.env.NEXTAUTH_URL?.includes(process.env.VERCEL_URL)
  ) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  }
}
