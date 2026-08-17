export const VIDEO_MIME = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
]);

/** Vercel serverless body limit is ~4.5MB — stay under it for inline uploads. */
export const INLINE_VIDEO_MAX_BYTES = 3_500_000;
export const BLOB_VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export function videoUploadConfig(): {
  provider: 'blob' | 'inline';
  maxBytes: number;
} {
  const blob = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  return {
    provider: blob ? 'blob' : 'inline',
    maxBytes: blob ? BLOB_VIDEO_MAX_BYTES : INLINE_VIDEO_MAX_BYTES,
  };
}

export function isAllowedVideoMime(mime: string, filename = ''): boolean {
  if (VIDEO_MIME.has(mime)) return true;
  const lower = filename.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.m4v');
}

export function assertVideoFile(opts: {
  mimeType: string;
  filename: string;
  size: number;
  maxBytes: number;
}): void {
  if (!isAllowedVideoMime(opts.mimeType, opts.filename)) {
    throw new Error('Video must be MP4, MOV, or WebM');
  }
  if (opts.size <= 0) {
    throw new Error('Video file is empty');
  }
  if (opts.size > opts.maxBytes) {
    const mb = Math.round(opts.maxBytes / (1024 * 1024));
    throw new Error(`Video must be under ${mb}MB`);
  }
}

export function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.round(n / 1024)}KB`;
}
