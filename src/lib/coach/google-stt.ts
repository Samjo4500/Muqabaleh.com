/**
 * Google Cloud Speech-to-Text for muqabaleh.com interview voice input.
 * Prefers OAuth service-account (required by some GCP projects); falls back to API key.
 * Never throws — callers must treat null/empty as text-fallback.
 */

import { getGoogleAccessToken, hasGoogleApiKey } from './google-auth';

export type SttLanguageMode = 'ar' | 'en' | 'mixed';

function languageConfig(mode: SttLanguageMode): {
  languageCode: string;
  alternativeLanguageCodes?: string[];
} {
  if (mode === 'en') return { languageCode: 'en-US' };
  if (mode === 'mixed') {
    return {
      languageCode: 'ar-SA',
      alternativeLanguageCodes: ['en-US'],
    };
  }
  return { languageCode: 'ar-SA' };
}

async function authorizeHeaders(): Promise<Record<string, string> | null> {
  const token = await getGoogleAccessToken([
    'https://www.googleapis.com/auth/cloud-platform',
  ]);
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  const key =
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_TTS_API_KEY?.trim() ||
    '';
  if (!key && !hasGoogleApiKey()) return null;
  if (!key) return null;
  return { 'Content-Type': 'application/json', 'x-goog-api-key': key };
}

function recognizeUrl(headers: Record<string, string>): string {
  if (headers.Authorization) {
    return 'https://speech.googleapis.com/v1/speech:recognize';
  }
  const key =
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_TTS_API_KEY?.trim() ||
    '';
  return `https://speech.googleapis.com/v1/speech:recognize?key=${encodeURIComponent(key)}`;
}

/**
 * Recognize WebM/Opus audio via Google Cloud Speech-to-Text.
 */
export async function transcribeWithGoogleStt(opts: {
  audio: Buffer;
  languageMode?: SttLanguageMode;
}): Promise<{ text: string; languageCode?: string } | null> {
  const headers = await authorizeHeaders();
  if (!headers) {
    console.warn('[coach/google-stt] no Google credentials configured');
    return null;
  }

  const mode = opts.languageMode || 'mixed';
  const lang = languageConfig(mode);
  const content = opts.audio.toString('base64');

  try {
    const res = await fetch(recognizeUrl(headers), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: lang.languageCode,
          ...(lang.alternativeLanguageCodes
            ? { alternativeLanguageCodes: lang.alternativeLanguageCodes }
            : {}),
          model: 'latest_long',
          enableAutomaticPunctuation: true,
        },
        audio: { content },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[coach/google-stt] API error', res.status, errText.slice(0, 300));
      return null;
    }

    const data = (await res.json()) as {
      results?: Array<{
        alternatives?: Array<{ transcript?: string }>;
        languageCode?: string;
      }>;
    };

    const parts =
      data.results
        ?.map((r) => r.alternatives?.[0]?.transcript?.trim())
        .filter((t): t is string => !!t) || [];

    const text = parts.join(' ').trim();
    if (!text) return null;

    return {
      text,
      languageCode: data.results?.[0]?.languageCode || lang.languageCode,
    };
  } catch (err) {
    console.error('[coach/google-stt] failed', err);
    return null;
  }
}
