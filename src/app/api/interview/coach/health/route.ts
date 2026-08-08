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

  if (geminiKey) {
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    for (const model of models) {
      geminiModelTried = model;
      try {
        const key = process.env.GEMINI_API_KEY!.trim();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Reply with exactly: OK' }] }],
          }),
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          geminiError = `${res.status}: ${errText.slice(0, 160)}`;
          continue;
        }
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          geminiPing = 'ok';
          geminiError = null;
          break;
        }
        geminiError = 'empty_response';
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
    hint:
      geminiPing === 'fail'
        ? 'GEMINI_API_KEY must be a Google AI Studio key (usually starts with AIza). Create at https://aistudio.google.com/apikey'
        : sttPing === 'fail'
          ? 'Speech API rejected API key auth. Add GOOGLE_APPLICATION_CREDENTIALS_JSON (service account) with Speech-to-Text enabled.'
          : null,
    vercelEnv: process.env.VERCEL_ENV || null,
  });
}
