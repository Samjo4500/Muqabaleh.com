import { getInterviewConfig } from './config';

/**
 * Speech-to-text via OpenAI Whisper API.
 * Auto language detection when language=undefined.
 */
export async function transcribeWithWhisper(
  audio: Buffer,
  filename = 'audio.webm',
): Promise<{ text: string; language?: string } | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.warn('[coach/whisper] OPENAI_API_KEY missing');
    return null;
  }

  const model = getInterviewConfig().engine.whisperModel || 'whisper-1';

  try {
    const form = new FormData();
    form.append('model', model);
    form.append(
      'file',
      new Blob([new Uint8Array(audio)], { type: 'audio/webm' }),
      filename,
    );
    // Omit language for auto-detect Arabic vs English

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[coach/whisper] API error', res.status, errText.slice(0, 200));
      return null;
    }

    const data = (await res.json()) as { text?: string };
    const text = (data.text || '').trim();
    if (!text) return null;
    return { text };
  } catch (err) {
    console.error('[coach/whisper] failed', err);
    return null;
  }
}
