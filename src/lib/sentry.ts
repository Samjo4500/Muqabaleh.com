/**
 * Sentry error reporting with PII scrubbing.
 * Uses @sentry/nextjs when available + SENTRY_DSN is set.
 * Never sends names, emails, transcripts, or raw audio payloads.
 */

const PII_KEYS = new Set([
  'email',
  'name',
  'fullName',
  'fullNameAr',
  'phone',
  'transcript',
  'transcripts',
  'audio',
  'audioBase64',
  'password',
  'passwordHash',
  'token',
  'authorization',
  'cvText',
  'resumeText',
  'message',
  'messages',
  'answer',
  'answers',
]);

function scrubValue(key: string, value: unknown): unknown {
  const lower = key.toLowerCase();
  if (
    PII_KEYS.has(key) ||
    PII_KEYS.has(lower) ||
    lower.includes('email') ||
    lower.includes('password') ||
    lower.includes('transcript') ||
    lower.includes('audio')
  ) {
    return '[redacted]';
  }
  if (typeof value === 'string') {
    // Scrub email-like substrings
    return value.replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      '[redacted-email]',
    );
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => scrubValue(String(i), v));
  }
  if (value && typeof value === 'object') {
    return scrubObject(value as Record<string, unknown>);
  }
  return value;
}

export function scrubObject(
  input: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!input) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    out[k] = scrubValue(k, v);
  }
  return out;
}

let initialized = false;

export async function initSentry(): Promise<void> {
  if (initialized) return;
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      beforeSend(event) {
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        if (event.user) {
          event.user = {
            id: event.user.id,
          };
        }
        if (event.extra) {
          event.extra = scrubObject(event.extra as Record<string, unknown>);
        }
        return event;
      },
    });
    initialized = true;
  } catch (err) {
    console.warn('[sentry] init skipped', err);
  }
}

export async function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.error('[sentry:local]', error, context ? scrubObject(context) : undefined);
    return;
  }
  try {
    await initSentry();
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureException(error, {
      extra: context ? scrubObject(context) : undefined,
    });
  } catch (err) {
    console.error('[sentry] capture failed', err);
  }
}
