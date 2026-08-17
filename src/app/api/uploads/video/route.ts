import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { BLOB_VIDEO_MAX_BYTES, VIDEO_MIME, videoUploadConfig } from '@/lib/uploads/video';

export const maxDuration = 30;

export async function GET() {
  return NextResponse.json(videoUploadConfig());
}

/** Client-side Vercel Blob upload token. Used only when BLOB_READ_WRITE_TOKEN is set. */
export async function POST(req: NextRequest) {
  const cfg = videoUploadConfig();
  if (cfg.provider !== 'blob') {
    return NextResponse.json(
      { error: 'Object storage is not configured. Short clips under 3.5MB still upload inline.' },
      { status: 503 },
    );
  }

  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...VIDEO_MIME],
        maximumSizeInBytes: BLOB_VIDEO_MAX_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(json);
  } catch (err) {
    console.error('[uploads/video]', err);
    return NextResponse.json({ error: 'Could not start video upload' }, { status: 400 });
  }
}
