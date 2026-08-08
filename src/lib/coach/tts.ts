import { getInterviewConfig } from './config';
import { getGoogleAccessToken, hasGoogleApiKey } from './google-auth';
import type { CoachGender } from './types';

export function resolveTtsVoice(
  coachGender: CoachGender,
  language: 'ar' | 'en',
): string {
  const cfg = getInterviewConfig();
  const coach =
    coachGender === 'male' ? cfg.coaches.male : cfg.coaches.female;
  return language === 'ar' ? coach.tts.ar : coach.tts.en;
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
  return { 'Content-Type': 'application/json' };
}

function synthesizeUrl(headers: Record<string, string>): string {
  if (headers.Authorization) {
    return 'https://texttospeech.googleapis.com/v1/text:synthesize';
  }
  const key =
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_TTS_API_KEY?.trim() ||
    '';
  return `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`;
}

/**
 * Google Cloud Text-to-Speech.
 * Returns base64 audio content (MP3) or null — never throws.
 */
export async function synthesizeSpeech(opts: {
  text: string;
  voiceName: string;
  languageCode: string;
}): Promise<{ audioBase64: string; mimeType: string } | null> {
  const headers = await authorizeHeaders();
  if (!headers) {
    console.warn('[coach/tts] no Google credentials configured');
    return null;
  }

  try {
    const res = await fetch(synthesizeUrl(headers), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input: { text: opts.text.slice(0, 4500) },
        voice: {
          languageCode: opts.languageCode,
          name: opts.voiceName,
        },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
      }),
    });

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
