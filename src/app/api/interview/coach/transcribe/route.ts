import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { transcribeWithWhisper } from '@/lib/coach/whisper';

export async function POST(req: NextRequest) {
  try {
    await requireApiAuth();
    const form = await req.formData();
    const file = form.get('audio');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'audio required' }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const result = await transcribeWithWhisper(buf, 'answer.webm');
    if (!result) {
      return NextResponse.json({ error: 'Transcription unavailable', text: '' }, { status: 200 });
    }
    return NextResponse.json({ text: result.text });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/coach/transcribe]', err);
    return NextResponse.json({ text: '', error: 'Transcription failed' }, { status: 200 });
  }
}
