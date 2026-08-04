import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  isAvailable: z.boolean().default(true),
});

const updateAvailabilitySchema = z.object({
  slots: z.array(slotSchema).max(42), // Max 6 slots per day * 7 days
});

// GET /api/interviewer/availability — get interviewer's availability slots
export async function GET() {
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
      select: { id: true },
    });

    if (!interviewer) {
      return NextResponse.json(
        { error: { ar: 'ملف المقابل غير موجود', en: 'Interviewer profile not found' } },
        { status: 404 },
      );
    }

    const slots = await db.interviewerAvailability.findMany({
      where: { interviewerId: interviewer.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json({ slots });
  } catch (err) {
    console.error('GET /api/interviewer/availability error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء جلب المواعيد', en: 'Error fetching availability' } },
      { status: 500 },
    );
  }
}

// PUT /api/interviewer/availability — replace all availability slots
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
      select: { id: true },
    });

    if (!interviewer) {
      return NextResponse.json(
        { error: { ar: 'ملف المقابل غير موجود', en: 'Interviewer profile not found' } },
        { status: 404 },
      );
    }

    const body = await req.json();
    const parsed = updateAvailabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { ar: 'بيانات غير صالحة', en: 'Invalid input', details: parsed.error.issues } },
        { status: 400 },
      );
    }

    const { slots } = parsed.data;

    // Delete existing slots and create new ones in a transaction
    await db.$transaction([
      db.interviewerAvailability.deleteMany({
        where: { interviewerId: interviewer.id },
      }),
      db.interviewerAvailability.createMany({
        data: slots.map((slot) => ({
          interviewerId: interviewer.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        })),
      }),
    ]);

    const updatedSlots = await db.interviewerAvailability.findMany({
      where: { interviewerId: interviewer.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json({ slots: updatedSlots });
  } catch (err) {
    console.error('PUT /api/interviewer/availability error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء تحديث المواعيد', en: 'Error updating availability' } },
      { status: 500 },
    );
  }
}
