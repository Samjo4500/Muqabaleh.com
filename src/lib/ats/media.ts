import { db } from '@/lib/db';
import {
  CV_MIME,
  MAX_CV_BYTES,
  MAX_PHOTO_BYTES,
  PHOTO_MIME,
} from './constants';

export type MediaKind = 'PHOTO' | 'CV' | 'OTHER';

function assertFile(kind: MediaKind, mimeType: string, size: number) {
  if (kind === 'PHOTO') {
    if (!PHOTO_MIME.has(mimeType)) {
      throw new Error('Photo must be JPEG, PNG, or WebP');
    }
    if (size > MAX_PHOTO_BYTES) {
      throw new Error('Photo must be under 800 KB');
    }
    return;
  }
  if (kind === 'CV') {
    if (!CV_MIME.has(mimeType)) {
      throw new Error('CV must be PDF or Word document');
    }
    if (size > MAX_CV_BYTES) {
      throw new Error('CV must be under 3 MB');
    }
  }
}

export async function saveMediaAsset(opts: {
  userId?: string | null;
  kind: MediaKind;
  filename: string;
  mimeType: string;
  data: Buffer;
}) {
  assertFile(opts.kind, opts.mimeType, opts.data.length);
  return db.mediaAsset.create({
    data: {
      userId: opts.userId || null,
      kind: opts.kind,
      filename: opts.filename.slice(0, 180),
      mimeType: opts.mimeType,
      size: opts.data.length,
      data: new Uint8Array(opts.data),
    },
    select: { id: true, filename: true, mimeType: true, size: true, kind: true },
  });
}

export async function getMediaAsset(id: string) {
  return db.mediaAsset.findUnique({ where: { id } });
}

export async function fileFromForm(
  form: FormData,
  key: string,
): Promise<{ filename: string; mimeType: string; data: Buffer } | null> {
  const entry = form.get(key);
  if (!entry || typeof entry === 'string') return null;
  const file = entry as File;
  if (!file.size) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  return {
    filename: file.name || key,
    mimeType: file.type || 'application/octet-stream',
    data: buf,
  };
}
