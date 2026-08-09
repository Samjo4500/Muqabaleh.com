import { NextResponse } from 'next/server';
import {
  getGoogleAccessToken,
  hasGeminiApiKey,
  hasGoogleApiKey,
  hasGoogleServiceAccount,
} from '@/lib/coach/google-auth';

/**
 * Preview/ops health for Jeannie coach providers.
 * Never returns secret values — only presence + a tiny live ping.
 */
export async function GET() {
  const geminiKey = hasGeminiApiKey();
  const googleKey = hasGoogleApiKey();
  const googleServiceAccount = hasGoogleServiceAccount();

  let geminiPing: 'ok' | 'fail' | 'skipped' = 'skipped';
  let geminiError: string | null = null;
  let geminiModelTried: string | null = null;

  if (geminiKey || googleServiceAccount) {
    const models = [
      'gemini-flash-latest',
      'gemini-pro-latest',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
    ];
    const accessToken = googleServiceAccount
      ? await getGoogleAccessToken([
          'https://www.googleapis.com/auth/generative-language',
        ])
      : null;
    const key = process.env.GEMINI_API_KEY?.trim() || null;

    for (const model of models) {
      geminiModelTried = model;
      try {
        const attempts: {
          url: string;
          headers: Record<string, string>;
          label: string;
        }[] = [];
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
        if (key) {
          attempts.push({
            label: 'api_key',
            url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        let modelOk = false;
        for (const attempt of attempts) {
          const res = await fetch(attempt.url, {
            method: 'POST',
            headers: attempt.headers,
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: 'Reply with exactly: OK' }] },
              ],
            }),
          });
          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            geminiError = `${attempt.label} ${res.status}: ${errText.slice(0, 160)}`;
            continue;
          }
          const data = (await res.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[];
          };
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            geminiPing = 'ok';
            geminiError = null;
            modelOk = true;
            break;
          }
          geminiError = `${attempt.label}: empty_response`;
        }
        if (modelOk) break;
      } catch (err) {
        geminiError = err instanceof Error ? err.message.slice(0, 160) : 'exception';
      }
    }
    if (geminiPing !== 'ok') geminiPing = 'fail';
  }

  let sttPing: 'ok' | 'fail' | 'skipped' = 'skipped';
  let sttError: string | null = null;
  let sttAuth: 'service_account' | 'api_key' | 'none' = 'none';
  if (googleServiceAccount || googleKey) {
    try {
      const token = await getGoogleAccessToken([
        'https://www.googleapis.com/auth/cloud-platform',
      ]);
      let res: Response;
      if (token) {
        sttAuth = 'service_account';
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
        });
      } else {
        sttAuth = 'api_key';
        const key = (
          process.env.GOOGLE_API_KEY ||
          process.env.GOOGLE_TTS_API_KEY ||
          ''
        ).trim();
        res = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${encodeURIComponent(key)}`,
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
          },
        );
      }
      const errText = await res.text().catch(() => '');
      // 400 INVALID_ARGUMENT usually means API reachable+authorized
      if (res.status === 400 || res.ok) {
        sttPing = 'ok';
      } else {
        sttPing = 'fail';
        sttError = `${res.status}: ${errText.slice(0, 160)}`;
      }
    } catch (err) {
      sttPing = 'fail';
      sttError = err instanceof Error ? err.message.slice(0, 160) : 'exception';
    }
  }

  const brevoKey = Boolean(process.env.BREVO_API_KEY?.trim());
  let brevoPing: 'ok' | 'fail' | 'skipped' = 'skipped';
  let brevoError: string | null = null;
  if (brevoKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/account', {
        headers: {
          'api-key': process.env.BREVO_API_KEY!.trim(),
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        brevoPing = 'ok';
      } else {
        brevoPing = 'fail';
        const errText = await res.text().catch(() => '');
        brevoError = `${res.status}: ${errText.slice(0, 160)}`;
      }
    } catch (err) {
      brevoPing = 'fail';
      brevoError = err instanceof Error ? err.message.slice(0, 160) : 'exception';
    }
  }

  return NextResponse.json({
    ok: geminiPing === 'ok' && (sttPing === 'ok' || googleServiceAccount),
    geminiKey,
    googleKey,
    googleServiceAccount,
    geminiPing,
    geminiModelTried,
    geminiError,
    sttPing,
    sttAuth,
    sttError,
    brevoKey,
    brevoPing,
    brevoError,
    hint:
      geminiPing === 'fail'
        ? 'Gemini failed. Prefer GOOGLE_APPLICATION_CREDENTIALS_JSON (service account) with Generative Language API enabled, or a valid AI Studio GEMINI_API_KEY.'
        : sttPing === 'fail'
          ? 'Speech API rejected API key auth. Add GOOGLE_APPLICATION_CREDENTIALS_JSON (service account) with Speech-to-Text enabled.'
          : !brevoKey
            ? 'BREVO_API_KEY missing — Pro/Premium passport emails will not send.'
            : brevoPing === 'fail'
              ? 'BREVO_API_KEY rejected by Brevo. Rotate the key and confirm muqabaleh.com / passport@muqabaleh.com is authenticated.'
              : null,
    vercelEnv: process.env.VERCEL_ENV || null,
  });
}
