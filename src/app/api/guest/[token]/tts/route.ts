import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { textToSpeech } from '@/lib/ai';
import { rateLimit } from '@/lib/rate-limit';
import { demoInterviews } from '@/lib/demo-state';

const IS_DEMO = process.env.DEMO_MODE === 'true';
const NO_DB = !process.env.DATABASE_URL;

const cache = new Map<string, { buffer: Buffer; createdAt: number }>();
const CACHE_MAX = 200;
const CACHE_TTL = 30 * 60 * 1000;

async function tokenExists(token: string): Promise<boolean> {
  if (demoInterviews.has(token)) return true;

  if (!IS_DEMO && !NO_DB) {
    try {
      const { db } = await import('@/lib/db');
      const interview = await db.interview.findFirst({
        where: { guestToken: token, mode: 'AI' },
        select: { id: true },
      });
      return Boolean(interview);
    } catch {
      return false;
    }
  }

  // Demo / no-DB: accept opaque guest tokens (created by /api/guest/interview)
  return /^[a-f0-9]{32,}$/i.test(token);
}

/** Guest-safe TTS authenticated by interview token (no login session). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!token || token.length < 16) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ok = await tokenExists(token);
    if (!ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!rateLimit(`guest-tts:${token}`, 12, 60_000)) {
      return NextResponse.json(
        { error: { ar: 'تم تجاوز الحد المسموح', en: 'Too many requests' } },
        { status: 429 },
      );
    }

    const { text, voice = 'fahd' } = await req.json();
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: { ar: 'النص مطلوب', en: 'Text is required' } },
        { status: 400 },
      );
    }
    if (!['fahd', 'noora'].includes(voice)) {
      return NextResponse.json(
        { error: { ar: 'صوت غير صالح', en: 'Invalid voice' } },
        { status: 400 },
      );
    }

    const trimmed = text.trim().slice(0, 2000);
    const hash = crypto.createHash('md5').update(`${voice}:${trimmed}`).digest('hex');
    const cached = cache.get(hash);
    if (cached && Date.now() - cached.createdAt < CACHE_TTL) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': cached.buffer.length.toString(),
          'Cache-Control': 'public, max-age=1800',
          'X-Cache': 'HIT',
        },
      });
    }

    const buffer = await textToSpeech(trimmed, voice as 'fahd' | 'noora');
    if (!buffer) {
      return NextResponse.json(
        { error: { ar: 'خدمة الصوت غير متاحة حالياً', en: 'Speech service unavailable' } },
        { status: 503 },
      );
    }

    if (cache.size >= CACHE_MAX) {
      const oldestKey = cache.keys().next().value!;
      cache.delete(oldestKey);
    }
    cache.set(hash, { buffer, createdAt: Date.now() });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=1800',
        'X-Cache': 'MISS',
      },
    });
  } catch (err) {
    console.error('Guest TTS error:', err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
