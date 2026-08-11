import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import {
  transcribeWithGoogleStt,
  type SttLanguageMode,
} from '@/lib/coach/google-stt';
import { findActiveCoachSession } from '@/lib/coach/session';
import { getCoachAccess } from '@/lib/coach/access';

/**
 * Legacy coach path — same Google STT backend as /api/speech-to-text.
 * Hard-gated to active session / remaining quota.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireApiAuth();
    const active = await findActiveCoachSession(userId);
    if (!active) {
      const access = await getCoachAccess(userId);
      if (!access.canStart) {
        return NextResponse.json(
          {
            error: 'Interview quota reached',
            text: '',
            fallback: true,
            upgradeRequired: true,
          },
          { status: 402 },
        );
      }
    }

    const form = await req.formData();
    const file = form.get('audio');
    const langRaw = String(form.get('language') || 'mixed');
    const languageMode: SttLanguageMode =
      langRaw === 'ar' || langRaw === 'en' || langRaw === 'mixed' ? langRaw : 'mixed';

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'audio required', text: '', fallback: true },
        { status: 200 },
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const result = await transcribeWithGoogleStt({
      audio: buf,
      languageMode,
    });

    if (!result?.text) {
      return NextResponse.json(
        { error: 'Transcription unavailable', text: '', fallback: true },
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
      return NextResponse.json(
        { error: err.message, text: '', fallback: true },
        { status: err.status },
      );
    }
    console.error('[api/coach/transcribe]', err);
    return NextResponse.json(
      { text: '', error: 'Transcription failed', fallback: true },
      { status: 200 },
    );
  }
}
