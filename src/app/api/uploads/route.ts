import { NextRequest, NextResponse } from 'next/server';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { fileFromForm, saveMediaAsset, type MediaKind } from '@/lib/ats/media';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';

export async function POST(req: NextRequest) {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/uploads', 30);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many uploads' }, { status: 429 });
  }

  try {
    const form = await req.formData();
    const kindRaw = String(form.get('kind') || 'OTHER').toUpperCase();
    const kind = (['PHOTO', 'CV', 'OTHER'].includes(kindRaw)
      ? kindRaw
      : 'OTHER') as MediaKind;
    const file = await fileFromForm(form, 'file');
    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    const asset = await saveMediaAsset({
      userId: user.id,
      kind,
      filename: file.filename,
      mimeType: file.mimeType,
      data: file.data,
    });
    return NextResponse.json({
      id: asset.id,
      filename: asset.filename,
      mimeType: asset.mimeType,
      size: asset.size,
      kind: asset.kind,
      url: `/api/media/${asset.id}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
