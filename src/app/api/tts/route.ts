import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/ai';
import crypto from 'crypto';

// In-memory cache for TTS
const cache = new Map<string, { buffer: Buffer; createdAt: number }>();
const CACHE_MAX = 200;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'fahd' } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: { ar: 'النص مطلوب', en: 'Text is required' } }, { status: 400 });
    }

    if (!['fahd', 'noora'].includes(voice)) {
      return NextResponse.json({ error: { ar: 'صوت غير صالح', en: 'Invalid voice' } }, { status: 400 });
    }

    // Check cache
    const hash = crypto.createHash('md5').update(`${voice}:${text}`).digest('hex');
    const cached = cache.get(hash);
    if (cached && Date.now() - cached.createdAt < CACHE_TTL) {
      return new NextResponse(cached.buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': cached.buffer.length.toString(),
          'Cache-Control': 'public, max-age=1800',
          'X-Cache': 'HIT',
        },
      });
    }

    // Generate TTS
    const buffer = await textToSpeech(text.trim(), voice as 'fahd' | 'noora');

    if (!buffer) {
      // 503 — client should fall back to text
      return NextResponse.json({ error: { ar: 'خدمة الصوت غير متاحة حالياً', en: 'Speech service unavailable' } }, { status: 503 });
    }

    // Save to cache
    if (cache.size >= CACHE_MAX) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    cache.set(hash, { buffer, createdAt: Date.now() });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=1800',
        'X-Cache': 'MISS',
      },
    });
  } catch (err) {
    console.error('TTS error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ في الخادم', en: 'Server error' } }, { status: 500 });
  }
}
