import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { fileFromForm, saveMediaAsset } from '@/lib/ats/media';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const { id: jobId } = await params;
  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/jobs/apply', 20);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many applications' }, { status: 429 });
  }

  try {
    const job = await db.b2BJob.findFirst({
      where: { id: jobId, isPublic: true, status: 'OPEN' },
    });
    if (!job) {
      return NextResponse.json({ error: 'Job not available' }, { status: 404 });
    }

    const existing = await db.jobApplication.findUnique({
      where: { jobId_candidateId: { jobId, candidateId: user.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Already applied', applicationId: existing.id },
        { status: 409 },
      );
    }

    const form = await req.formData();
    const coverLetter = String(form.get('coverLetter') || '').slice(0, 5000);
    const joinTalentPool = String(form.get('joinTalentPool') || '') === 'true';

    let cvAssetId: string | undefined;
    let photoAssetId: string | undefined;

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

    // Fall back to talent-pool CV/photo if not uploaded now
    const pool = await db.candidatePool.findUnique({ where: { userId: user.id } });
    if (!cvAssetId && pool?.cvAssetId) cvAssetId = pool.cvAssetId;
    if (!photoAssetId && pool?.photoAssetId) photoAssetId = pool.photoAssetId;

    if (!cvAssetId) {
      return NextResponse.json(
        { error: 'Please upload your CV / resume' },
        { status: 400 },
      );
    }

    const application = await db.jobApplication.create({
      data: {
        jobId,
        candidateId: user.id,
        coverLetter: coverLetter || null,
        cvAssetId,
        photoAssetId: photoAssetId || null,
        source: 'DIRECT',
        stage: 'NEW',
      },
    });

    if (joinTalentPool || pool) {
      const role = String(form.get('role') || pool?.role || job.title).slice(0, 120);
      const level = String(form.get('level') || pool?.level || 'MID').slice(0, 40);
      await db.candidatePool.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          isOptedIn: true,
          isVisible: true,
          openToWork: true,
          role,
          level,
          industry: job.industry,
          location: job.location || job.city,
          desiredRole: role,
          cvAssetId,
          cvFileName: cv?.filename || pool?.cvFileName,
          photoAssetId: photoAssetId || null,
        },
        update: {
          isOptedIn: true,
          isVisible: true,
          openToWork: true,
          ...(cvAssetId ? { cvAssetId, cvFileName: cv?.filename || pool?.cvFileName } : {}),
          ...(photoAssetId ? { photoAssetId } : {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      stage: application.stage,
    });
  } catch (e) {
    console.error('POST apply', e);
    const msg = e instanceof Error ? e.message : 'Application failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
