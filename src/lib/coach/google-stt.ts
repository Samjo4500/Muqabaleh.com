/**
 * Google Cloud Speech-to-Text for muqabaleh.com interview voice input.
 * Never throws — callers must treat null/empty as text-fallback.
 */

export type SttLanguageMode = 'ar' | 'en' | 'mixed';

function googleApiKey(): string | null {
  return (
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_TTS_API_KEY?.trim() ||
    null
  );
}

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

/**
 * Recognize WebM/Opus audio via Google Cloud Speech-to-Text.
 */
export async function transcribeWithGoogleStt(opts: {
  audio: Buffer;
  languageMode?: SttLanguageMode;
}): Promise<{ text: string; languageCode?: string } | null> {
  const key = googleApiKey();
  if (!key) {
    console.warn('[coach/google-stt] GOOGLE_API_KEY missing');
    return null;
  }

  const mode = opts.languageMode || 'mixed';
  const lang = languageConfig(mode);
  const content = opts.audio.toString('base64');

  try {
    const res = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      },
    );

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
