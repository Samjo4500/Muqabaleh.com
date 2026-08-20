import { db } from '@/lib/db';
import {
  getGoogleAccessToken,
  hasGeminiApiKey,
  hasGoogleApiKey,
  hasGoogleServiceAccount,
} from '@/lib/coach/google-auth';
import {
  applyRuntimeEnvDefaults,
  getBrevoApiKey,
  getNextAuthSecret,
  resolveNextAuthUrl,
} from '@/lib/env/runtime';

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
  return {
    pass: checks.filter((c) => c.status === 'pass').length,
    fail: checks.filter((c) => c.status === 'fail').length,
    warn: checks.filter((c) => c.status === 'warn').length,
    skip: checks.filter((c) => c.status === 'skip').length,
    total: checks.length,
  };
}

function overallFrom(checks: HealthCheckResult[]): 'green' | 'yellow' | 'red' {
  const criticalFail = checks.some((c) => c.critical && c.status === 'fail');
  if (criticalFail) return 'red';
  const anyFail = checks.some((c) => c.status === 'fail');
  const anyWarn = checks.some((c) => c.status === 'warn');
  if (anyFail || anyWarn) return 'yellow';
  return 'green';
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const started = Date.now();
  try {
    // SERIAL queries only — prod DATABASE_URL uses PgBouncer with
    // connection_limit=1; Promise.all would exhaust the pool and throw
    // "Timed out fetching a new connection from the connection pool".
    await db.$queryRaw`SELECT 1`;
    const users = await db.user.count();
    const jobs = await db.b2BJob.count().catch(() => 0);
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

async function checkGemini(): Promise<HealthCheckResult> {
  const started = Date.now();
  const geminiKey = hasGeminiApiKey();
  const sa = hasGoogleServiceAccount();
  if (!geminiKey && !sa) {
    return {
      id: 'gemini',
      label: { ar: 'Gemini / جيني', en: 'Gemini AI' },
      category: 'ai',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: 'GEMINI_API_KEY or service account missing',
    };
  }

  try {
    const models = ['gemini-flash-latest', 'gemini-pro-latest', 'gemini-2.5-flash'];
    const accessToken = sa
      ? await getGoogleAccessToken([
          'https://www.googleapis.com/auth/generative-language',
        ])
      : null;
    const key = process.env.GEMINI_API_KEY?.trim() || null;
    let lastErr = 'no response';

    for (const model of models) {
      const attempts: { url: string; headers: Record<string, string> }[] = [];
      if (accessToken) {
        attempts.push({
          url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
      if (key) {
        attempts.push({
          url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      for (const attempt of attempts) {
        const res = await fetch(attempt.url, {
          method: 'POST',
          headers: attempt.headers,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Reply with exactly: OK' }] }],
          }),
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) {
          lastErr = `${model} ${res.status}`;
          continue;
        }
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          return {
            id: 'gemini',
            label: { ar: 'Gemini / جيني', en: 'Gemini AI' },
            category: 'ai',
            status: 'pass',
            critical: true,
            latencyMs: Date.now() - started,
            detail: `Live OK · ${model}`,
          };
        }
        lastErr = `${model}: empty`;
      }
    }
    return {
      id: 'gemini',
      label: { ar: 'Gemini / جيني', en: 'Gemini AI' },
      category: 'ai',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: lastErr.slice(0, 160),
    };
  } catch (err) {
    return {
      id: 'gemini',
      label: { ar: 'Gemini / جيني', en: 'Gemini AI' },
      category: 'ai',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message.slice(0, 160) : 'exception',
    };
  }
}

async function checkSpeech(): Promise<HealthCheckResult> {
  const started = Date.now();
  const sa = hasGoogleServiceAccount();
  const key = hasGoogleApiKey();
  if (!sa && !key) {
    return {
      id: 'speech',
      label: { ar: 'التعرّف على الكلام', en: 'Speech-to-Text' },
      category: 'ai',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: 'Google credentials missing',
    };
  }
  try {
    const token = await getGoogleAccessToken([
      'https://www.googleapis.com/auth/cloud-platform',
    ]);
    let res: Response;
    if (token) {
      res = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
          },
          audio: { content: Buffer.from('not-audio').toString('base64') },
        }),
        signal: AbortSignal.timeout(10000),
      });
    } else {
      const apiKey = (
        process.env.GOOGLE_API_KEY ||
        process.env.GOOGLE_TTS_API_KEY ||
        ''
      ).trim();
      res = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              sampleRateHertz: 48000,
              languageCode: 'en-US',
            },
            audio: { content: Buffer.from('not-audio').toString('base64') },
          }),
          signal: AbortSignal.timeout(10000),
        },
      );
    }
    // 400 = API reachable + authorized with bad payload
    if (res.ok || res.status === 400) {
      return {
        id: 'speech',
        label: { ar: 'التعرّف على الكلام', en: 'Speech-to-Text' },
        category: 'ai',
        status: 'pass',
        critical: true,
        latencyMs: Date.now() - started,
        detail: token ? 'Service account OK' : 'API key OK',
      };
    }
    const errText = await res.text().catch(() => '');
    return {
      id: 'speech',
      label: { ar: 'التعرّف على الكلام', en: 'Speech-to-Text' },
      category: 'ai',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: `${res.status}: ${errText.slice(0, 120)}`,
    };
  } catch (err) {
    return {
      id: 'speech',
      label: { ar: 'التعرّف على الكلام', en: 'Speech-to-Text' },
      category: 'ai',
      status: 'fail',
      critical: true,
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message.slice(0, 160) : 'exception',
    };
  }
}

async function checkBrevo(): Promise<HealthCheckResult> {
  const started = Date.now();
  const key = getBrevoApiKey();
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
    const body = await res.text().catch(() => '');
    const hint =
      res.status === 401
        ? ' — rotate BREVO_API_KEY in Vercel (Key not found)'
        : '';
    return {
      id: 'brevo',
      label: { ar: 'بريد Brevo (الجواز)', en: 'Brevo (passport email)' },
      category: 'comms',
      status: 'fail',
      critical: false,
      latencyMs: Date.now() - started,
      detail: `HTTP ${res.status}${hint}${body ? `: ${body.slice(0, 80)}` : ''}`,
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

function checkResend(): HealthCheckResult {
  const key = Boolean(process.env.RESEND_API_KEY?.trim());
  return {
    id: 'resend',
    label: { ar: 'بريد Resend', en: 'Resend email' },
    category: 'comms',
    status: key ? 'pass' : 'warn',
    critical: false,
    detail: key ? 'RESEND_API_KEY configured' : 'RESEND_API_KEY missing',
  };
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
  applyRuntimeEnvDefaults();
  const secret = Boolean(getNextAuthSecret());
  const { url, source } = resolveNextAuthUrl();
  if (secret && url) {
    const urlNote =
      source === 'NEXTAUTH_URL'
        ? 'NEXTAUTH_SECRET + NEXTAUTH_URL set'
        : `NEXTAUTH_SECRET set · URL via ${source} (${url})`;
    return {
      id: 'auth',
      label: { ar: 'المصادقة', en: 'Auth (NextAuth)' },
      category: 'core',
      status: 'pass',
      critical: true,
      detail: urlNote,
    };
  }
  return {
    id: 'auth',
    label: { ar: 'المصادقة', en: 'Auth (NextAuth)' },
    category: 'core',
    status: 'fail',
    critical: true,
    detail: !secret
      ? 'NEXTAUTH_SECRET missing'
      : 'NEXTAUTH_URL empty — set https://muqabaleh.com in Vercel',
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
  applyRuntimeEnvDefaults();
  const started = Date.now();
  const checks = await Promise.all([
    checkDatabase(),
    checkAuthEnv(),
    checkGemini(),
    checkSpeech(),
    checkBrevo(),
    Promise.resolve(checkResend()),
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
