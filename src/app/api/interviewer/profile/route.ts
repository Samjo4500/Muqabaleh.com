import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateProfileSchema = z.object({
  bio: z.string().max(3000).optional(),
  bioAr: z.string().max(3000).optional(),
  specialties: z.array(z.string().max(100)).optional(),
  industries: z.array(z.string().max(100)).optional(),
  languages: z.array(z.string().max(10)).optional(),
  hourlyRate: z.number().int().min(1999).optional(),
  payoutEmail: z.string().email().max(255).optional(),
});

// PUT /api/interviewer/profile — update own interviewer profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    const interviewer = await db.interviewer.findUnique({
      where: { userId },
    });

    if (!interviewer) {
      return NextResponse.json(
        { error: { ar: 'ملف المقابل غير موجود', en: 'Interviewer profile not found' } },
        { status: 404 },
      );
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { ar: 'بيانات غير صالحة', en: 'Invalid input', details: parsed.error.issues } },
        { status: 400 },
      );
    }

    const { bio, bioAr, specialties, industries, languages, hourlyRate, payoutEmail } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (bio !== undefined) updateData.bio = bio;
    if (bioAr !== undefined) updateData.bioAr = bioAr;
    if (specialties !== undefined) updateData.specialties = JSON.stringify(specialties);
    if (industries !== undefined) updateData.industries = JSON.stringify(industries);
    if (languages !== undefined) updateData.languages = JSON.stringify(languages);
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (payoutEmail !== undefined) updateData.payoutEmail = payoutEmail;

    const updated = await db.interviewer.update({
      where: { id: interviewer.id },
      data: updateData,
    });

    return NextResponse.json({
      interviewer: {
        ...updated,
        specialties: JSON.parse((updated.specialties as string) || '[]'),
        industries: JSON.parse((updated.industries as string) || '[]'),
        languages: JSON.parse((updated.languages as string) || '["AR"]'),
      },
    });
  } catch (err) {
    console.error('PUT /api/interviewer/profile error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء تحديث الملف الشخصي', en: 'Error updating profile' } },
      { status: 500 },
    );
  }
}
