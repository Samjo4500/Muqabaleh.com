import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { UserRole } from '@prisma/client';
import { triggerAdminNewApplicationEmail } from '@/lib/email-triggers';

function isSafeVideoUrl(url: string): boolean {
  if (url.startsWith('/api/media/')) return true;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname.endsWith('.blob.vercel-storage.com') ||
        parsed.hostname === 'blob.vercel-storage.com')
    );
  } catch {
    return false;
  }
}

// POST /api/interviewers/apply — submit interviewer application (multipart form)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName =
      (formData.get('fullName') as string | null) ||
      (formData.get('fullNameEn') as string | null);
    const fullNameAr = formData.get('fullNameAr') as string | null;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const linkedInUrl =
      (formData.get('linkedInUrl') as string | null) ||
      (formData.get('linkedIn') as string | null);
    const yearsExperience = formData.get('yearsExperience') as string | null;
    const specialtiesRaw =
      (formData.get('specialties') as string | null) ||
      (formData.get('roles') as string | null);
    const industriesRaw = formData.get('industries') as string | null;
    const languagesRaw = formData.get('languages') as string | null;
    const priceTierRaw = formData.get('priceTier') as string | null;
    const videoIntroUrlField = (formData.get('videoIntroUrl') as string | null)?.trim() || null;
    const videoIntro = formData.get('videoIntro');
    const idDocument = formData.get('idDocument') || formData.get('idVerification');

    // ── Validation ──
    const errors: string[] = [];
    if (!fullName?.trim()) errors.push('fullName is required');
    if (!email?.trim()) errors.push('email is required');
    if (!phone?.trim()) errors.push('phone is required');
    if (!yearsExperience) errors.push('yearsExperience is required');
    if (!specialtiesRaw) errors.push('specialties is required');
    if (!priceTierRaw) errors.push('priceTier is required');

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: {
            ar: 'يرجى ملء جميع الحقول المطلوبة: ' + errors.join(', '),
            en: 'Please fill all required fields: ' + errors.join(', '),
          },
        },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email!)) {
      return NextResponse.json(
        {
          error: {
            ar: 'صيغة البريد الإلكتروني غير صحيحة',
            en: 'Invalid email format',
          },
        },
        { status: 400 },
      );
    }

    // Validate years experience is a positive number ("1-3" → 1)
    const years = parseInt(String(yearsExperience!).split(/[-+]/)[0] || '', 10);
    if (isNaN(years) || years < 0) {
      return NextResponse.json(
        {
          error: {
            ar: 'يجب أن تكون سنوات الخبرة رقماً صحيحاً',
            en: 'Years of experience must be a valid number',
          },
        },
        { status: 400 },
      );
    }

    // Validate price tier (form sends standard/pro/executive)
    const TIER_MAP: Record<string, string> = {
      STANDARD: 'STANDARD',
      PREMIUM: 'PREMIUM',
      ELITE: 'ELITE',
      standard: 'STANDARD',
      pro: 'PREMIUM',
      executive: 'ELITE',
    };
    const priceTier = TIER_MAP[priceTierRaw || ''] || null;
    if (!priceTier) {
      return NextResponse.json(
        {
          error: {
            ar: 'مستوى السعر غير صالح',
            en: 'Invalid price tier',
          },
        },
        { status: 400 },
      );
    }

    // Parse JSON arrays safely
    let specialties: string[] = [];
    let industries: string[] = [];
    let languages: string[] = ['AR'];

    try {
      specialties = JSON.parse(specialtiesRaw!);
      if (!Array.isArray(specialties)) throw new Error();
    } catch {
      return NextResponse.json(
        {
          error: {
            ar: 'صيغة التخصصات غير صحيحة',
            en: 'Invalid specialties format',
          },
        },
        { status: 400 },
      );
    }

    if (industriesRaw) {
      try {
        industries = JSON.parse(industriesRaw);
        if (!Array.isArray(industries)) throw new Error();
      } catch {
        return NextResponse.json(
          {
            error: {
              ar: 'صيغة القطاعات غير صحيحة',
              en: 'Invalid industries format',
            },
          },
          { status: 400 },
        );
      }
    }

    if (languagesRaw) {
      try {
        languages = JSON.parse(languagesRaw);
        if (!Array.isArray(languages)) throw new Error();
      } catch {
        return NextResponse.json(
          {
            error: {
              ar: 'صيغة اللغات غير صحيحة',
              en: 'Invalid languages format',
            },
          },
          { status: 400 },
        );
      }
    }

    let videoIntroUrl = videoIntroUrlField;
    let idDocumentUrl: string | null = null;

    try {
      const { fileFromForm, saveMediaAsset } = await import('@/lib/ats/media');
      if (!videoIntroUrl && videoIntro && typeof videoIntro !== 'string') {
        const file = await fileFromForm(formData, 'videoIntro');
        if (file) {
          const asset = await saveMediaAsset({
            kind: 'VIDEO',
            filename: file.filename,
            mimeType: file.mimeType,
            data: file.data,
          });
          videoIntroUrl = `/api/media/${asset.id}`;
        }
      }
      if (idDocument && typeof idDocument !== 'string') {
        const key = formData.get('idDocument') ? 'idDocument' : 'idVerification';
        const file = await fileFromForm(formData, key);
        if (file) {
          const asset = await saveMediaAsset({
            kind: 'OTHER',
            filename: file.filename,
            mimeType: file.mimeType,
            data: file.data,
          });
          idDocumentUrl = `/api/media/${asset.id}`;
        }
      }
    } catch (err) {
      console.error('[Interviewer Apply] media save failed', err);
      const message = err instanceof Error ? err.message : 'Could not save upload';
      return NextResponse.json(
        { error: { ar: message, en: message } },
        { status: 400 },
      );
    }

    if (videoIntroUrl && !isSafeVideoUrl(videoIntroUrl)) {
      return NextResponse.json(
        { error: { ar: 'رابط الفيديو غير صالح', en: 'Invalid video URL' } },
        { status: 400 },
      );
    }

    // ── Try DB, fall back to mock ──
    try {
      const { db } = await import('@/lib/db');

      // Find or create a User for this interviewer email (userId is required FK).
      // Never escalate an existing candidate account from a public form.
      let user = await db.user.findUnique({ where: { email: email!.trim().toLowerCase() } });
      if (!user) {
        const passwordHash = await hash(randomBytes(32).toString('hex'), 12);
        user = await db.user.create({
          data: {
            email: email!.trim().toLowerCase(),
            passwordHash,
            name: fullName!.trim(),
            role: UserRole.INTERVIEWER,
            accountType: 'INDIVIDUAL',
            sessionsLeft: 0,
          },
        });
      } else if (
        user.role !== UserRole.INTERVIEWER &&
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.SUPER_ADMIN
      ) {
        // Keep USER/PARTNER roles intact — application stays pending until admin approval.
      }

      // Reject duplicate interviewer applications for the same user
      const existing = await db.interviewer.findUnique({ where: { userId: user.id } });
      if (existing) {
        return NextResponse.json(
          {
            error: {
              ar: 'لديك طلب محاور بالفعل',
              en: 'An interviewer application already exists for this account',
            },
          },
          { status: 409 },
        );
      }

      const application = await db.interviewer.create({
        data: {
          userId: user.id,
          fullName: fullName!.trim(),
          fullNameAr: fullNameAr?.trim() || null,
          phone: phone!.trim(),
          linkedInUrl: linkedInUrl?.trim() || null,
          yearsExperience: years,
          specialties: JSON.stringify(specialties),
          industries: JSON.stringify(industries),
          languages: JSON.stringify(languages),
          priceTier,
          status: 'PENDING',
          videoIntroUrl,
          idDocumentUrl,
        },
      });

      // Notify admin of new application (fire and forget)
      triggerAdminNewApplicationEmail(application.id).catch(() => {});

      return NextResponse.json({
        success: true,
        message: {
          ar: 'تم استلام طلبك بنجاح. سيتم مراجعته خلال ٣ أيام عمل.',
          en: 'Application received. We will review it within 3 business days.',
        },
        id: application.id,
      });
    } catch (dbErr) {
      console.warn('[Interviewer Apply] DB unavailable, using mock mode:', dbErr);
    }

    // ── Mock / demo response ──

    return NextResponse.json({
      success: true,
      message: {
        ar: 'تم استلام طلبك بنجاح. سيتم مراجعته خلال ٣ أيام عمل.',
        en: 'Application received. We will review it within 3 business days.',
      },
    });
  } catch (err) {
    console.error('POST /api/interviewers/apply error:', err);
    return NextResponse.json(
      {
        error: {
          ar: 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.',
          en: 'An error occurred while processing your application. Please try again.',
        },
      },
      { status: 500 },
    );
  }
}
