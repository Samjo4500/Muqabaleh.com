import { NextResponse } from 'next/server';

/**
 * Preview/ops health for Jeannie coach providers.
 * Never returns secret values — only presence + a tiny live ping.
 */
export async function GET() {
  const geminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
  const googleKey = Boolean(
    process.env.GOOGLE_API_KEY?.trim() || process.env.GOOGLE_TTS_API_KEY?.trim(),
  );

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
  if (googleKey) {
    try {
      const key = (
        process.env.GOOGLE_API_KEY ||
        process.env.GOOGLE_TTS_API_KEY ||
        ''
      ).trim();
      // Minimal invalid audio request — 400 with API enabled vs 403/404 for auth/API disabled
      const res = await fetch(
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
      const errText = await res.text().catch(() => '');
      // 200 unexpected; 400 INVALID_ARGUMENT usually means API reachable+authorized
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
    ok: geminiPing === 'ok' && googleKey,
    geminiKey,
    googleKey,
    geminiPing,
    geminiModelTried,
    geminiError,
    sttPing,
    sttError,
    vercelEnv: process.env.VERCEL_ENV || null,
  });
}
