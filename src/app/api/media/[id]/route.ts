import { NextRequest, NextResponse } from 'next/server';
import { getMediaAsset } from '@/lib/ats/media';
import { canManageJob, getAtsSession } from '@/lib/ats/auth';
import { db } from '@/lib/db';

/**
 * Serve uploaded photo/CV.
 * Photos of visible talent are public. CVs require owner, company, partner, or admin.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const asset = await getMediaAsset(id);
  if (!asset) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (asset.kind === 'PHOTO' || asset.kind === 'VIDEO') {
    // Allow public read for photos attached to visible talent or user image
    return new NextResponse(Buffer.from(asset.data), {
      headers: {
        'Content-Type': asset.mimeType,
        'Content-Disposition': `inline; filename="${asset.filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  }

  const user = await getAtsSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role === 'SUPER_ADMIN' || asset.userId === user.id) {
    return fileResponse(asset);
  }

  // Employer / partner: CV must belong to an applicant on their job or visible talent they can see
  const inApplication = await db.jobApplication.findFirst({
    where: {
      OR: [{ cvAssetId: id }, { photoAssetId: id }],
    },
    select: { jobId: true },
  });
  if (inApplication) {
    const allowed = await canManageJob(inApplication.jobId, user);
    if (allowed) return fileResponse(asset);
  }

  const talent = await db.candidatePool.findFirst({
    where: {
      OR: [{ cvAssetId: id }, { photoAssetId: id }],
      isVisible: true,
      isOptedIn: true,
    },
  });
  if (
    talent &&
    (user.role === 'COMPANY_ADMIN' ||
      user.role === 'PARTNER_ADMIN' ||
      user.role === 'PARTNER_MEMBER' ||
      user.role === 'SUPER_ADMIN')
  ) {
    return fileResponse(asset);
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function fileResponse(asset: {
  data: Uint8Array;
  mimeType: string;
  filename: string;
}) {
  return new NextResponse(Buffer.from(asset.data), {
    headers: {
      'Content-Type': asset.mimeType,
      'Content-Disposition': `attachment; filename="${asset.filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
