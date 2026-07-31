import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { speechToText } from '@/lib/ai';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { ar: 'يجب تسجيل الدخول', en: 'Login required' } }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;

    // Get form data with audio file
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: { ar: 'ملف صوتي مطلوب', en: 'Audio file required' } }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: { ar: 'حجم الملف يتجاوز 10 ميجابايت', en: 'File exceeds 10MB limit' } }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const text = await speechToText(buffer);

    return NextResponse.json({ text });
  } catch (err) {
    console.error('ASR error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ في التفريغ', en: 'Transcription error' } }, { status: 500 });
  }
}
