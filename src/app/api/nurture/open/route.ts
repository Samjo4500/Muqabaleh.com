import { NextRequest, NextResponse } from 'next/server';
import { recordEmailOpen } from '@/lib/nurture/process';

const GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t') || '';
  const enrollmentId = req.nextUrl.searchParams.get('e');
  if (token) {
    try {
      await recordEmailOpen(token, enrollmentId);
    } catch {
      /* never fail the pixel */
    }
  }
  return new NextResponse(GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}
