import { getInterviewConfig } from './config';
import type { CoachGender } from './types';

function googleApiKey(): string | null {
  return (
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_TTS_API_KEY?.trim() ||
    null
  );
}

export function resolveTtsVoice(
  coachGender: CoachGender,
  language: 'ar' | 'en',
): string {
  const cfg = getInterviewConfig();
  const coach =
    coachGender === 'male' ? cfg.coaches.male : cfg.coaches.female;
  return language === 'ar' ? coach.tts.ar : coach.tts.en;
}

/**
 * Google Cloud Text-to-Speech (GOOGLE_API_KEY).
 * Returns base64 audio content (MP3) or null — never throws.
 */
export async function synthesizeSpeech(opts: {
  text: string;
  voiceName: string;
  languageCode: string;
}): Promise<{ audioBase64: string; mimeType: string } | null> {
  const key = googleApiKey();
  if (!key) {
    console.warn('[coach/tts] GOOGLE_API_KEY missing');
    return null;
  }

  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: opts.text.slice(0, 4500) },
          voice: {
            languageCode: opts.languageCode,
            name: opts.voiceName,
          },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[coach/tts] API error', res.status, errText.slice(0, 200));
      return null;
    }

    const data = (await res.json()) as { audioContent?: string };
    if (!data.audioContent) return null;
    return { audioBase64: data.audioContent, mimeType: 'audio/mpeg' };
  } catch (err) {
    console.error('[coach/tts] failed', err);
    return null;
  }
}
