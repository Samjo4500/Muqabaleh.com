import { NextRequest, NextResponse } from 'next/server';
import { hashSync } from 'bcryptjs';
import { db } from '@/lib/db';
import { getAtsSession } from '@/lib/ats/auth';
import { fileFromForm, saveMediaAsset } from '@/lib/ats/media';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';
import { triggerWelcomeEmail } from '@/lib/email-triggers';
import { serializeTalent } from '@/lib/ats/serialize';

/**
 * Create (or update) a full talent-pool profile with CV + photo.
 * Unauthenticated callers must provide email/password/name to create an account.
 */
export async function POST(req: NextRequest) {
  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/talent/register', 10);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  }

  try {
    const form = await req.formData();
    const sessionUser = await getAtsSession();

    let userId = sessionUser?.id || '';
    let createdAccount = false;

    if (!userId) {
      const email = String(form.get('email') || '')
        .trim()
        .toLowerCase();
      const password = String(form.get('password') || '');
      const name = String(form.get('name') || '').trim();
      if (!email || !password || password.length < 8 || name.length < 2) {
        return NextResponse.json(
          { error: 'Name, email, and password (8+ chars) are required' },
          { status: 400 },
        );
      }
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: 'Email already registered. Please sign in and update your profile.' },
          { status: 409 },
        );
      }
      const user = await db.user.create({
        data: {
          email,
          passwordHash: hashSync(password, 12),
          name,
          role: 'USER',
          accountType: 'INDIVIDUAL',
          country: String(form.get('country') || '') || null,
          industry: String(form.get('industry') || '') || null,
          experience: String(form.get('level') || '') || null,
          sessionsLeft: 1,
        },
      });
      userId = user.id;
      createdAccount = true;
      triggerWelcomeEmail(user.id, 'ar').catch(() => {});
      triggerWelcomeEmail(user.id, 'en').catch(() => {});
    }

    const role = String(form.get('role') || form.get('desiredRole') || '').trim();
    const level = String(form.get('level') || 'MID').trim();
    if (!role) {
      return NextResponse.json({ error: 'Desired role is required' }, { status: 400 });
    }

    const cv = await fileFromForm(form, 'cv');
    const photo = await fileFromForm(form, 'photo');

    let cvAssetId: string | undefined;
    let cvFileName: string | undefined;
    let photoAssetId: string | undefined;

    if (cv) {
      const asset = await saveMediaAsset({
        userId,
        kind: 'CV',
        filename: cv.filename,
        mimeType: cv.mimeType,
        data: cv.data,
      });
      cvAssetId = asset.id;
      cvFileName = asset.filename;
    }

    if (photo) {
      const asset = await saveMediaAsset({
        userId,
        kind: 'PHOTO',
        filename: photo.filename,
        mimeType: photo.mimeType,
        data: photo.data,
      });
      photoAssetId = asset.id;
      await db.user.update({
        where: { id: userId },
        data: {
          image: `/api/media/${asset.id}`,
          country: String(form.get('country') || '') || undefined,
          industry: String(form.get('industry') || '') || undefined,
          name: String(form.get('name') || '') || undefined,
        },
      });
    } else if (form.get('name') || form.get('country')) {
      await db.user.update({
        where: { id: userId },
        data: {
          ...(form.get('name') ? { name: String(form.get('name')) } : {}),
          ...(form.get('country') ? { country: String(form.get('country')) } : {}),
          ...(form.get('industry') ? { industry: String(form.get('industry')) } : {}),
        },
      });
    }

    const yearsRaw = String(form.get('yearsExperience') || '');
    const yearsExperience = yearsRaw ? Number.parseInt(yearsRaw, 10) : null;

    const existing = await db.candidatePool.findUnique({ where: { userId } });
    if (!cvAssetId && !existing?.cvAssetId) {
      return NextResponse.json(
        { error: 'Please upload your CV / resume' },
        { status: 400 },
      );
    }

    const pool = await db.candidatePool.upsert({
      where: { userId },
      create: {
        userId,
        isOptedIn: true,
        isVisible: true,
        openToWork: String(form.get('openToWork') || 'true') !== 'false',
        role,
        level,
        industry: String(form.get('industry') || '') || null,
        location: String(form.get('location') || '') || null,
        headline: String(form.get('headline') || '') || null,
        summary: String(form.get('summary') || '') || null,
        skills: String(form.get('skills') || '') || null,
        yearsExperience: Number.isFinite(yearsExperience) ? yearsExperience : null,
        phone: String(form.get('phone') || '') || null,
        linkedInUrl: String(form.get('linkedInUrl') || '') || null,
        desiredRole: String(form.get('desiredRole') || role) || role,
        desiredLocations: String(form.get('desiredLocations') || '') || null,
        languages: String(form.get('languages') || 'AR,EN'),
        availability: String(form.get('availability') || 'AVAILABLE'),
        cvAssetId: cvAssetId!,
        cvFileName: cvFileName || null,
        photoAssetId: photoAssetId || null,
      },
      update: {
        isOptedIn: true,
        isVisible: true,
        openToWork: String(form.get('openToWork') || 'true') !== 'false',
        role,
        level,
        industry: String(form.get('industry') || '') || null,
        location: String(form.get('location') || '') || null,
        headline: String(form.get('headline') || '') || null,
        summary: String(form.get('summary') || '') || null,
        skills: String(form.get('skills') || '') || null,
        yearsExperience: Number.isFinite(yearsExperience) ? yearsExperience : null,
        phone: String(form.get('phone') || '') || null,
        linkedInUrl: String(form.get('linkedInUrl') || '') || null,
        desiredRole: String(form.get('desiredRole') || role) || role,
        desiredLocations: String(form.get('desiredLocations') || '') || null,
        languages: String(form.get('languages') || 'AR,EN'),
        availability: String(form.get('availability') || 'AVAILABLE'),
        ...(cvAssetId ? { cvAssetId, cvFileName } : {}),
        ...(photoAssetId ? { photoAssetId } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            country: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      createdAccount,
      profile: serializeTalent(pool),
      redirectTo: createdAccount ? '/auth/signin?from=talent' : '/jobs/talent?done=1',
    });
  } catch (e) {
    console.error('talent register', e);
    const msg = e instanceof Error ? e.message : 'Registration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
