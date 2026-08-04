import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createBookingSchema = z.object({
  interviewerId: z.string().uuid(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  durationMinutes: z.number().int().min(15).max(120),
  candidateNote: z.string().max(2000).optional(),
});

// POST /api/bookings — create a new booking
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { ar: 'بيانات غير صالحة', en: 'Invalid input', details: parsed.error.issues } },
        { status: 400 },
      );
    }

    const { interviewerId, scheduledAt, durationMinutes, candidateNote } = parsed.data;
    const userId = (session.user as Record<string, unknown>).id as string;

    // Look up interviewer
    const interviewer = await db.interviewer.findUnique({
      where: { id: interviewerId },
    });

    if (!interviewer || interviewer.status !== 'APPROVED') {
      return NextResponse.json(
        { error: { ar: 'المقابل غير موجود أو غير معتمد', en: 'Interviewer not found or not approved' } },
        { status: 404 },
      );
    }

    if (interviewer.hourlyRate < 1999) {
      return NextResponse.json(
        { error: { ar: 'سعر المقابل غير صالح', en: 'Interviewer pricing is invalid' } },
        { status: 400 },
      );
    }

    // Calculate prices (all in cents)
    const priceTotal = Math.round((interviewer.hourlyRate * durationMinutes) / 60);
    const platformFee = Math.round(priceTotal * 0.2);
    const interviewerPayout = priceTotal - platformFee;

    const scheduledDate = new Date(scheduledAt);

    const booking = await db.humanBooking.create({
      data: {
        userId,
        candidateName: session.user.name || 'Candidate',
        candidateEmail: session.user.email || '',
        interviewerId,
        scheduledAt: scheduledDate,
        durationMinutes,
        priceTotal,
        platformFee,
        interviewerPayout,
        candidateNote: candidateNote || null,
        status: 'PENDING',
      },
      include: {
        interviewer: {
          select: {
            id: true,
            fullName: true,
            fullNameAr: true,
            priceTier: true,
            hourlyRate: true,
          },
        },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error('POST /api/bookings error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء إنشاء الحجز', en: 'Error creating booking' } },
      { status: 500 },
    );
  }
}

// GET /api/bookings — list user's bookings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status') || 'ALL';
    const userId = (session.user as Record<string, unknown>).id as string;

    const where: Record<string, unknown> = { userId };

    if (statusFilter === 'UPCOMING') {
      where.scheduledAt = { gte: new Date() };
      where.status = { in: ['PENDING', 'CONFIRMED'] };
    } else if (statusFilter === 'PAST') {
      where.OR = [
        { scheduledAt: { lt: new Date() } },
        { status: { in: ['COMPLETED', 'CANCELLED'] } },
      ];
    }

    const bookings = await db.humanBooking.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      include: {
        interviewer: {
          select: {
            id: true,
            fullName: true,
            fullNameAr: true,
            priceTier: true,
            hourlyRate: true,
            rating: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
    });

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error('GET /api/bookings error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء جلب الحجوزات', en: 'Error fetching bookings' } },
      { status: 500 },
    );
  }
}
