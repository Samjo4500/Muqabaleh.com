import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { serializeTalent } from '@/lib/ats/serialize';
import { fileFromForm, saveMediaAsset } from '@/lib/ats/media';

export async function GET() {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const pool = await db.candidatePool.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, country: true, image: true },
      },
    },
  });
  if (!pool) {
    return NextResponse.json({ profile: null });
  }
  return NextResponse.json({ profile: serializeTalent(pool) });
}

export async function PATCH(req: NextRequest) {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  try {
    const contentType = req.headers.get('content-type') || '';
    let data: Record<string, unknown> = {};
    let cvAssetId: string | undefined;
    let cvFileName: string | undefined;
    let photoAssetId: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      for (const key of [
        'role',
        'level',
        'industry',
        'location',
        'headline',
        'summary',
        'skills',
        'phone',
        'linkedInUrl',
        'desiredRole',
        'desiredLocations',
        'languages',
        'availability',
        'yearsExperience',
        'openToWork',
        'isVisible',
        'isOptedIn',
        'name',
        'country',
      ]) {
        if (form.has(key)) data[key] = String(form.get(key));
      }
      const cv = await fileFromForm(form, 'cv');
      if (cv) {
        const asset = await saveMediaAsset({
          userId: user.id,
          kind: 'CV',
          filename: cv.filename,
          mimeType: cv.mimeType,
          data: cv.data,
        });
        cvAssetId = asset.id;
        cvFileName = asset.filename;
      }
      const photo = await fileFromForm(form, 'photo');
      if (photo) {
        const asset = await saveMediaAsset({
          userId: user.id,
          kind: 'PHOTO',
          filename: photo.filename,
          mimeType: photo.mimeType,
          data: photo.data,
        });
        photoAssetId = asset.id;
        await db.user.update({
          where: { id: user.id },
          data: { image: `/api/media/${asset.id}` },
        });
      }
    } else {
      data = await req.json();
    }

    if (data.name || data.country) {
      await db.user.update({
        where: { id: user.id },
        data: {
          ...(typeof data.name === 'string' ? { name: data.name } : {}),
          ...(typeof data.country === 'string' ? { country: data.country } : {}),
        },
      });
    }

    const years =
      data.yearsExperience !== undefined && data.yearsExperience !== ''
        ? Number.parseInt(String(data.yearsExperience), 10)
        : undefined;

    const pool = await db.candidatePool.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        isOptedIn: data.isOptedIn !== 'false' && data.isOptedIn !== false,
        isVisible: data.isVisible !== 'false' && data.isVisible !== false,
        openToWork: data.openToWork !== 'false' && data.openToWork !== false,
        role: String(data.role || data.desiredRole || 'Professional'),
        level: String(data.level || 'MID'),
        industry: (data.industry as string) || null,
        location: (data.location as string) || null,
        headline: (data.headline as string) || null,
        summary: (data.summary as string) || null,
        skills: (data.skills as string) || null,
        yearsExperience: Number.isFinite(years) ? years : null,
        phone: (data.phone as string) || null,
        linkedInUrl: (data.linkedInUrl as string) || null,
        desiredRole: (data.desiredRole as string) || null,
        desiredLocations: (data.desiredLocations as string) || null,
        languages: String(data.languages || 'AR,EN'),
        availability: String(data.availability || 'AVAILABLE'),
        cvAssetId: cvAssetId || null,
        cvFileName: cvFileName || null,
        photoAssetId: photoAssetId || null,
      },
      update: {
        ...(data.role ? { role: String(data.role) } : {}),
        ...(data.level ? { level: String(data.level) } : {}),
        ...(data.industry !== undefined ? { industry: String(data.industry || '') || null } : {}),
        ...(data.location !== undefined ? { location: String(data.location || '') || null } : {}),
        ...(data.headline !== undefined ? { headline: String(data.headline || '') || null } : {}),
        ...(data.summary !== undefined ? { summary: String(data.summary || '') || null } : {}),
        ...(data.skills !== undefined ? { skills: String(data.skills || '') || null } : {}),
        ...(years !== undefined ? { yearsExperience: Number.isFinite(years) ? years : null } : {}),
        ...(data.phone !== undefined ? { phone: String(data.phone || '') || null } : {}),
        ...(data.linkedInUrl !== undefined
          ? { linkedInUrl: String(data.linkedInUrl || '') || null }
          : {}),
        ...(data.desiredRole !== undefined
          ? { desiredRole: String(data.desiredRole || '') || null }
          : {}),
        ...(data.desiredLocations !== undefined
          ? { desiredLocations: String(data.desiredLocations || '') || null }
          : {}),
        ...(data.languages ? { languages: String(data.languages) } : {}),
        ...(data.availability ? { availability: String(data.availability) } : {}),
        ...(data.openToWork !== undefined
          ? { openToWork: data.openToWork !== 'false' && data.openToWork !== false }
          : {}),
        ...(data.isVisible !== undefined
          ? { isVisible: data.isVisible !== 'false' && data.isVisible !== false }
          : {}),
        ...(data.isOptedIn !== undefined
          ? { isOptedIn: data.isOptedIn !== 'false' && data.isOptedIn !== false }
          : {}),
        ...(cvAssetId ? { cvAssetId, cvFileName } : {}),
        ...(photoAssetId ? { photoAssetId } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, country: true, image: true },
        },
      },
    });

    return NextResponse.json({ success: true, profile: serializeTalent(pool) });
  } catch (e) {
    console.error('PATCH talent/me', e);
    const msg = e instanceof Error ? e.message : 'Update failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
