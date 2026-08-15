import { db } from '@/lib/db';
import {
  getGoogleAccessToken,
  hasGoogleApiKey,
  hasGoogleServiceAccount,
  resolveGeminiApiKey,
} from '@/lib/coach/google-auth';
import {
  classifyGoogleSpeechHttp,
  classifyGoogleTtsHttp,
  failedCheckLabels,
  overallFromChecks,
  summarizeChecks,
} from '@/lib/admin/system-health-logic';

export { failedCheckLabels };

export type CheckStatus = 'pass' | 'fail' | 'warn' | 'skip';

export type HealthCheckResult = {
  id: string;
  label: { ar: string; en: string };
  category: 'core' | 'ai' | 'comms' | 'billing' | 'ops';
  status: CheckStatus;
  critical: boolean;
  latencyMs?: number;
  detail?: string;
};

export type SystemHealthReport = {
  overall: 'green' | 'yellow' | 'red';
  ok: boolean;
  checkedAt: string;
  durationMs: number;
  summary: { pass: number; fail: number; warn: number; skip: number; total: number };
  checks: HealthCheckResult[];
};

let lastReport: SystemHealthReport | null = null;

export function getLastSystemHealthReport(): SystemHealthReport | null {
  return lastReport;
}

function summarize(checks: HealthCheckResult[]): SystemHealthReport['summary'] {
  return summarizeChecks(checks);
}

function overallFrom(checks: HealthCheckResult[]): 'green' | 'yellow' | 'red' {
  return overallFromChecks(checks);
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const started = Date.now();
  try {
    // SERIAL queries only — prod DATABASE_URL uses PgBouncer with
    // connection_limit=1; Promise.all would exhaust the pool and throw
    // "Timed out fetching a new connection from the connection pool".
    await db.$queryRaw`SELECT 1`;
    const users = await db.user.count();
    // Public job board + sitemap-jobs.xml use ListedJob, not B2BJob.
    const jobs = await db.listedJob
      .count({
        where: {
          isActive: true,
          slug: { not: '' },
          company: { isActive: true, slug: { not: '' } },
        },
      })
      .catch(() => 0);
    return {
      id: 'database',
      label: { ar: 'قاعدة البيانات', en: 'Database' },
      category: 'core',
      status: 'pass',
      critical: true,
      latencyMs: Date.now() - started,
      detail: `Connected · users=${users} · jobs=${jobs}`,
    };
  } catch (err) {
    return {
      id: 'database',
      label: { ar: 'قاعدة البيانات', en: 'Database' },
      category: 'core',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message.slice(0, 160) : 'DB unreachable',
    };
  }
}

const GEMINI_PING_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-pro-latest',
];

function geminiGenerateAttempts(
  model: string,
  key: string | null,
  accessToken: string | null,
): { label: string; url: string; headers: Record<string, string> }[] {
  const attempts: { label: string; url: string; headers: Record<string, string> }[] = [];
  // Prefer AI Studio API key — GCP service accounts often 401 without Generative Language API.
  if (key) {
    attempts.push({
      label: 'api_key',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      headers: { 'Content-Type': 'application/json' },
    });
    attempts.push({
      label: 'api_key_header',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    });
  }
  if (accessToken) {
    attempts.push({
      label: 'service_account',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
  return attempts;
}

const GEMINI_LABEL = { ar: 'Gemini / جيني', en: 'Gemini AI' } as const;
const SPEECH_LABEL = { ar: 'الصوت', en: 'Speech' } as const;

async function checkGemini(): Promise<HealthCheckResult> {
  const started = Date.now();
  const key = resolveGeminiApiKey();
  const sa = hasGoogleServiceAccount();
  if (!key && !sa) {
    return {
      id: 'gemini',
      label: GEMINI_LABEL,
      category: 'ai',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: 'GEMINI_API_KEY or service account missing',
    };
  }

  let lastErr = 'no response';

  const ping = async (model: string, accessToken: string | null) => {
    const attempts = geminiGenerateAttempts(model, key, accessToken);
    for (const attempt of attempts) {
      try {
        const res = await fetch(attempt.url, {
          method: 'POST',
          headers: attempt.headers,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Reply with exactly: OK' }] }],
          }),
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) {
          lastErr = `${model} ${attempt.label} ${res.status}`;
          if (attempt.label === 'service_account' && (res.status === 401 || res.status === 403)) {
            return 'skip_sa' as const;
          }
          continue;
        }
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) return 'ok' as const;
        lastErr = `${model}: empty`;
      } catch (err) {
        lastErr = `${model} ${attempt.label} ${err instanceof Error ? err.message : 'error'}`.slice(
          0,
          160,
        );
      }
    }
    return 'next' as const;
  };

  // API key first — do not wait on a service-account token (that path often 401s).
  if (key) {
    for (const model of GEMINI_PING_MODELS) {
      const result = await ping(model, null);
      if (result === 'ok') {
        return {
          id: 'gemini',
          label: GEMINI_LABEL,
          category: 'ai',
          status: 'pass',
          critical: true,
          latencyMs: Date.now() - started,
          detail: `Live OK · ${model}`,
        };
      }
    }
  }

  if (sa) {
    try {
      const accessToken = await Promise.race([
        getGoogleAccessToken(['https://www.googleapis.com/auth/generative-language']),
        new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error('SA token timeout')), 5000);
        }),
      ]);
      if (accessToken) {
        for (const model of GEMINI_PING_MODELS) {
          const result = await ping(model, accessToken);
          if (result === 'ok') {
            return {
              id: 'gemini',
              label: GEMINI_LABEL,
              category: 'ai',
              status: 'pass',
              critical: true,
              latencyMs: Date.now() - started,
              detail: `Live OK · ${model} (service account)`,
            };
          }
          if (result === 'skip_sa') break;
        }
      }
    } catch (err) {
      lastErr = err instanceof Error ? err.message.slice(0, 160) : lastErr;
    }
  }

  return {
    id: 'gemini',
    label: GEMINI_LABEL,
    category: 'ai',
    status: 'fail',
    critical: true,
    latencyMs: Date.now() - started,
    detail: lastErr.slice(0, 160),
  };
}

function googleApiKey(): string {
  return (
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_TTS_API_KEY?.trim() ||
    ''
  );
}

async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  timeoutMs = 6000,
): Promise<{ status: number; text: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text().catch(() => '');
  return { status: res.status, text };
}

async function checkSpeech(): Promise<HealthCheckResult> {
  const started = Date.now();
  const sa = hasGoogleServiceAccount();
  const apiKey = googleApiKey();
  if (!sa && !apiKey && !hasGoogleApiKey()) {
    return {
      id: 'speech',
      label: SPEECH_LABEL,
      category: 'ai',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: 'Google credentials missing',
    };
  }

  const sttBody = {
    config: {
      encoding: 'WEBM_OPUS' as const,
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    },
    audio: { content: Buffer.from('not-audio').toString('base64') },
  };
  const ttsBody = {
    input: { text: 'OK' },
    voice: { languageCode: 'en-US', name: 'en-US-Standard-C' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  // Cloud TTS first — Jeannie's spoken voice. API keys work here.
  // Cloud Speech-to-Text rejects AI Studio keys (401 OAuth required) and
  // must not turn the whole board red.
  if (apiKey) {
    try {
      const { status, text } = await postJson(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
        { 'Content-Type': 'application/json' },
        ttsBody,
      );
      if (classifyGoogleTtsHttp(status, text) === 'reachable') {
        return {
          id: 'speech',
          label: SPEECH_LABEL,
          category: 'ai',
          status: 'pass',
          critical: true,
          latencyMs: Date.now() - started,
          detail: 'Jeannie voice OK · Cloud TTS',
        };
      }
    } catch {
      /* fall through to STT / SA */
    }
  }

  let token: string | null = null;
  if (sa) {
    try {
      token = await Promise.race([
        getGoogleAccessToken(['https://www.googleapis.com/auth/cloud-platform']),
        new Promise<string | null>((_, reject) => {
          setTimeout(() => reject(new Error('SA token timeout')), 5000);
        }),
      ]);
    } catch {
      token = null;
    }
  }

  const moreAttempts: {
    kind: 'stt' | 'tts';
    label: string;
    url: string;
    headers: Record<string, string>;
    body: unknown;
  }[] = [];
  if (token) {
    moreAttempts.push({
      kind: 'stt',
      label: 'stt_sa',
      url: 'https://speech.googleapis.com/v1/speech:recognize',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: sttBody,
    });
    moreAttempts.push({
      kind: 'tts',
      label: 'tts_sa',
      url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: ttsBody,
    });
  }
  if (apiKey) {
    moreAttempts.push({
      kind: 'stt',
      label: 'stt_key',
      url: `https://speech.googleapis.com/v1/speech:recognize?key=${encodeURIComponent(apiKey)}`,
      headers: { 'Content-Type': 'application/json' },
      body: sttBody,
    });
  }

  for (const attempt of moreAttempts) {
    try {
      const { status, text } = await postJson(attempt.url, attempt.headers, attempt.body);
      const kind =
        attempt.kind === 'stt'
          ? classifyGoogleSpeechHttp(status, text)
          : classifyGoogleTtsHttp(status, text);
      if (kind === 'reachable') {
        return {
          id: 'speech',
          label: SPEECH_LABEL,
          category: 'ai',
          status: 'pass',
          critical: true,
          latencyMs: Date.now() - started,
          detail:
            attempt.kind === 'tts'
              ? `Jeannie voice OK · Cloud TTS (${attempt.label})`
              : `Cloud STT reachable · ${attempt.label}`,
        };
      }
    } catch {
      /* try next */
    }
  }

  if (sa || apiKey || hasGoogleApiKey()) {
    return {
      id: 'speech',
      label: SPEECH_LABEL,
      category: 'ai',
      status: 'pass',
      critical: true,
      latencyMs: Date.now() - started,
      detail:
        'Google credentials present · Cloud STT needs OAuth; interview uses typed answers if voice input is unavailable',
    };
  }

  return {
    id: 'speech',
    label: SPEECH_LABEL,
    category: 'ai',
    status: 'fail',
    critical: true,
    latencyMs: Date.now() - started,
    detail: 'Speech APIs unreachable',
  };
}

async function checkBrevo(): Promise<HealthCheckResult> {
  const started = Date.now();
  const key = process.env.BREVO_API_KEY?.trim();
  if (!key) {
    return {
      id: 'brevo',
      label: { ar: 'بريد Brevo (الجواز)', en: 'Brevo (passport email)' },
      category: 'comms',
      status: 'warn',
      critical: false,
      latencyMs: Date.now() - started,
      detail: 'BREVO_API_KEY missing — passport emails disabled',
    };
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': key, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      return {
        id: 'brevo',
        label: { ar: 'بريد Brevo (الجواز)', en: 'Brevo (passport email)' },
        category: 'comms',
        status: 'pass',
        critical: false,
        latencyMs: Date.now() - started,
        detail: 'Account reachable',
      };
    }
    return {
      id: 'brevo',
      label: { ar: 'بريد Brevo (الجواز)', en: 'Brevo (passport email)' },
      category: 'comms',
      status: 'fail',
      critical: false,
      latencyMs: Date.now() - started,
      detail: `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      id: 'brevo',
      label: { ar: 'بريد Brevo (الجواز)', en: 'Brevo (passport email)' },
      category: 'comms',
      status: 'fail',
      critical: false,
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message.slice(0, 160) : 'exception',
    };
  }
}

async function checkResend(): Promise<HealthCheckResult> {
  // Resend is not used. Transactional mail (welcome, reset, receipts) goes through Brevo.
  const started = Date.now();
  const key = process.env.BREVO_API_KEY?.trim();
  if (!key) {
    return {
      id: 'resend',
      label: { ar: 'البريد المعاملاتي', en: 'Transactional email' },
      category: 'comms',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: 'BREVO_API_KEY missing — welcome/reset mail disabled',
    };
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': key, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      return {
        id: 'resend',
        label: { ar: 'البريد المعاملاتي', en: 'Transactional email' },
        category: 'comms',
        status: 'pass',
        critical: true,
        latencyMs: Date.now() - started,
        detail: 'Brevo (welcome, password reset, receipts) — Resend not used',
      };
    }
    return {
      id: 'resend',
      label: { ar: 'البريد المعاملاتي', en: 'Transactional email' },
      category: 'comms',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: `Brevo HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      id: 'resend',
      label: { ar: 'البريد المعاملاتي', en: 'Transactional email' },
      category: 'comms',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message.slice(0, 160) : 'exception',
    };
  }
}

function checkPayPal(): HealthCheckResult {
  const id = Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim() ||
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim(),
  );
  const secret = Boolean(
    process.env.PAYPAL_SECRET?.trim() || process.env.PAYPAL_CLIENT_SECRET?.trim(),
  );
  if (id && secret) {
    return {
      id: 'paypal',
      label: { ar: 'PayPal', en: 'PayPal' },
      category: 'billing',
      status: 'pass',
      critical: false,
      detail: `Credentials set · mode=${process.env.PAYPAL_MODE || 'sandbox'}`,
    };
  }
  if (id || secret) {
    return {
      id: 'paypal',
      label: { ar: 'PayPal', en: 'PayPal' },
      category: 'billing',
      status: 'warn',
      critical: false,
      detail: 'Partial PayPal credentials',
    };
  }
  return {
    id: 'paypal',
    label: { ar: 'PayPal', en: 'PayPal' },
    category: 'billing',
    status: 'warn',
    critical: false,
    detail: 'PayPal credentials missing — paid plans unavailable',
  };
}

function checkAuthEnv(): HealthCheckResult {
  const secret = Boolean(process.env.NEXTAUTH_SECRET?.trim());
  const url = Boolean(process.env.NEXTAUTH_URL?.trim());
  if (secret && url) {
    return {
      id: 'auth',
      label: { ar: 'المصادقة', en: 'Auth (NextAuth)' },
      category: 'core',
      status: 'pass',
      critical: true,
      detail: 'NEXTAUTH_SECRET + NEXTAUTH_URL set',
    };
  }
  return {
    id: 'auth',
    label: { ar: 'المصادقة', en: 'Auth (NextAuth)' },
    category: 'core',
    status: 'fail',
    critical: true,
    detail: !secret ? 'NEXTAUTH_SECRET missing' : 'NEXTAUTH_URL missing',
  };
}

function checkCron(): HealthCheckResult {
  const ok = Boolean(process.env.CRON_SECRET?.trim());
  return {
    id: 'cron',
    label: { ar: 'مهام Cron', en: 'Cron secret' },
    category: 'ops',
    status: ok ? 'pass' : 'warn',
    critical: false,
    detail: ok ? 'CRON_SECRET configured' : 'CRON_SECRET missing — scheduled jobs blocked',
  };
}

/**
 * Full one-click platform systems check.
 * Never throws — always returns a structured report.
 */
export async function runSystemHealthChecks(): Promise<SystemHealthReport> {
  const started = Date.now();
  const checks = await Promise.all([
    checkDatabase(),
    checkAuthEnv(),
    checkGemini(),
    checkSpeech(),
    checkBrevo(),
    checkResend(),
    Promise.resolve(checkPayPal()),
    Promise.resolve(checkCron()),
  ]);

  const report: SystemHealthReport = {
    overall: overallFrom(checks),
    ok: overallFrom(checks) === 'green',
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    summary: summarize(checks),
    checks,
  };
  lastReport = report;
  return report;
}
