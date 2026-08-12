import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { detectReplyLanguage } from '@/lib/coach/gemini';
import { resolveTtsVoice, synthesizeSpeech } from '@/lib/coach/tts';
import { findActiveCoachSession } from '@/lib/coach/session';
import { getCoachAccess } from '@/lib/coach/access';
import type { CoachGender } from '@/lib/coach/types';
import { enforceIpRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limited = await enforceIpRateLimit('/api/interview/*', 10);
  if (limited) return limited;

  try {
    const { userId } = await requireApiAuth();
    const body = (await req.json()) as {
      text?: string;
      coachGender?: CoachGender;
      languageHint?: 'ar' | 'en' | 'mixed';
      sessionId?: string;
    };

    // Hard gate: TTS only during an active coach session (or while user can start).
    const active = await findActiveCoachSession(userId);
    if (!active) {
      const access = await getCoachAccess(userId);
      if (!access.canStart) {
        return NextResponse.json(
          { error: 'Interview quota reached', upgradeRequired: true, audioBase64: null },
          { status: 402 },
        );
      }
    } else if (body.sessionId && body.sessionId !== active.sessionId) {
      return NextResponse.json(
        { error: 'Session mismatch', audioBase64: null },
        { status: 403 },
      );
    }

    const text = (body.text || '').trim();
    if (!text) {
      return NextResponse.json({ error: 'text required' }, { status: 400 });
    }

    const fallbackLang = body.languageHint === 'en' ? 'en' : 'ar';
    const lang = detectReplyLanguage(text, fallbackLang);
    const voiceName = resolveTtsVoice(body.coachGender || 'female', lang);
    const languageCode = lang === 'ar' ? 'ar-XA' : 'en-US';

    const audio = await synthesizeSpeech({ text, voiceName, languageCode });
    if (!audio) {
      return NextResponse.json({ audioBase64: null, voiceName, language: lang });
    }
    return NextResponse.json({
      audioBase64: audio.audioBase64,
      mimeType: audio.mimeType,
      voiceName,
      language: lang,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/coach/speak]', err);
    return NextResponse.json({ audioBase64: null }, { status: 200 });
  }
}
