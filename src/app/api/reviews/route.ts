import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { BookingStatus } from '@/lib/enums';
import { z } from 'zod';

const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// POST /api/reviews — create a review for a completed booking
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
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { ar: 'بيانات غير صالحة', en: 'Invalid input', details: parsed.error.issues } },
        { status: 400 },
      );
    }

    const { bookingId, rating, comment } = parsed.data;
    const userId = (session.user as Record<string, unknown>).id as string;

    // Validate booking exists, belongs to user, is COMPLETED, and has no review yet
    const booking = await db.humanBooking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: { ar: 'الحجز غير موجود', en: 'Booking not found' } },
        { status: 404 },
      );
    }

    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح بتقييم هذا الحجز', en: 'Not authorized to review this booking' } },
        { status: 403 },
      );
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      return NextResponse.json(
        { error: { ar: 'لا يمكن تقييم حجز غير مكتمل', en: 'Cannot review a booking that is not completed' } },
        { status: 400 },
      );
    }

    if (!booking.interviewerId) {
      return NextResponse.json(
        { error: { ar: 'لا يوجد محاور مرتبط بهذا الحجز', en: 'Booking has no assigned interviewer' } },
        { status: 400 },
      );
    }

    if (booking.review) {
      return NextResponse.json(
        { error: { ar: 'تم تقييم هذا الحجز مسبقاً', en: 'This booking has already been reviewed' } },
        { status: 409 },
      );
    }

    const interviewerId = booking.interviewerId;

    // Create the review
    const review = await db.interviewerReview.create({
      data: {
        interviewerId,
        bookingId,
        rating,
        comment: comment || null,
        isPublic: true,
      },
    });

    // Recalculate average rating for the interviewer
    const reviews = await db.interviewerReview.findMany({
      where: { interviewerId },
      select: { rating: true },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await db.interviewer.update({
      where: { id: interviewerId },
      data: { rating: Math.round(avgRating * 100) / 100 },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error('POST /api/reviews error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء إنشاء التقييم', en: 'Error creating review' } },
      { status: 500 },
    );
  }
}
