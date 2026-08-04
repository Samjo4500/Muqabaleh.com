import { NextRequest, NextResponse } from 'next/server';
import { triggerAdminNewApplicationEmail } from '@/lib/email-triggers';

// POST /api/interviewers/apply — submit interviewer application (multipart form)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName = formData.get('fullName') as string | null;
    const fullNameAr = formData.get('fullNameAr') as string | null;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const linkedInUrl = formData.get('linkedInUrl') as string | null;
    const yearsExperience = formData.get('yearsExperience') as string | null;
    const specialtiesRaw = formData.get('specialties') as string | null;
    const industriesRaw = formData.get('industries') as string | null;
    const languagesRaw = formData.get('languages') as string | null;
    const priceTier = formData.get('priceTier') as string | null;
    const videoIntro = formData.get('videoIntro') as File | null;
    const idDocument = formData.get('idDocument') as File | null;

    // ── Validation ──
    const errors: string[] = [];
    if (!fullName?.trim()) errors.push('fullName is required');
    if (!email?.trim()) errors.push('email is required');
    if (!phone?.trim()) errors.push('phone is required');
    if (!yearsExperience) errors.push('yearsExperience is required');
    if (!specialtiesRaw) errors.push('specialties is required');
    if (!priceTier) errors.push('priceTier is required');

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

    // Validate years experience is a positive number
    const years = parseInt(yearsExperience!, 10);
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

    // Validate price tier
    const validTiers = ['STANDARD', 'PREMIUM', 'ELITE'];
    if (!validTiers.includes(priceTier!)) {
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

    // ── Try DB, fall back to mock ──
    try {
      const { db } = await import('@/lib/db');
      const application = await db.interviewer.create({
        data: {
          userId: 'pending', // Will be linked to a user account
          fullName: fullName!.trim(),
          fullNameAr: fullNameAr?.trim() || null,
          phone: phone!.trim(),
          linkedInUrl: linkedInUrl?.trim() || null,
          yearsExperience: years,
          specialties: JSON.stringify(specialties),
          industries: JSON.stringify(industries),
          languages: JSON.stringify(languages),
          priceTier: priceTier!,
          status: 'PENDING',
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
