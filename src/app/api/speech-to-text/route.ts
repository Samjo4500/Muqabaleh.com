import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import {
import { enforceIpRateLimit } from '@/lib/rate-limit';
  transcribeWithGoogleStt,
  type SttLanguageMode,
} from '@/lib/coach/google-stt';

/**
 * POST /api/speech-to-text
 * Browser MediaRecorder WebM/Opus → Google Cloud Speech-to-Text.
 * Never crashes the interview — empty text triggers client text fallback.
 */
export async function POST(req: NextRequest) {
  const limited = await enforceIpRateLimit('/api/speech-to-text', 5);
  if (limited) return limited;

  try {
    await requireApiAuth();

    const contentType = req.headers.get('content-type') || '';
    let audioBuf: Buffer | null = null;
    let languageMode: SttLanguageMode = 'mixed';

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('audio');
      const lang = String(form.get('language') || 'mixed');
      if (lang === 'ar' || lang === 'en' || lang === 'mixed') languageMode = lang;
      if (file instanceof Blob) {
        audioBuf = Buffer.from(await file.arrayBuffer());
      }
    } else {
      const body = (await req.json().catch(() => null)) as {
        audioBase64?: string;
        language?: string;
      } | null;
      const lang = body?.language || 'mixed';
      if (lang === 'ar' || lang === 'en' || lang === 'mixed') languageMode = lang;
      if (body?.audioBase64) {
        audioBuf = Buffer.from(body.audioBase64, 'base64');
      }
    }

    if (!audioBuf?.length) {
      return NextResponse.json(
        { text: '', error: 'audio required', fallback: true },
        { status: 200 },
      );
    }

    const result = await transcribeWithGoogleStt({
      audio: audioBuf,
      languageMode,
    });

    if (!result?.text) {
      return NextResponse.json(
        {
          text: '',
          error: 'Transcription unavailable',
          fallback: true,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      text: result.text,
      languageCode: result.languageCode,
      fallback: false,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message, text: '', fallback: true }, { status: err.status });
    }
    console.error('[api/speech-to-text]', err);
    return NextResponse.json(
      { text: '', error: 'Transcription failed', fallback: true },
      { status: 200 },
    );
  }
}
