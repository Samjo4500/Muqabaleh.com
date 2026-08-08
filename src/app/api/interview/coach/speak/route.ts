import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { detectReplyLanguage } from '@/lib/coach/gemini';
import { resolveTtsVoice, synthesizeSpeech } from '@/lib/coach/tts';
import type { CoachGender } from '@/lib/coach/types';

export async function POST(req: NextRequest) {
  try {
    await requireApiAuth();
    const body = (await req.json()) as {
      text?: string;
      coachGender?: CoachGender;
      languageHint?: 'ar' | 'en' | 'mixed';
    };

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
