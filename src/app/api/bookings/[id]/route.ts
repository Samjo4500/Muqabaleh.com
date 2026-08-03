import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
};

const updateBookingSchema = z.object({
  status: z.enum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  cancelledBy: z.string().max(50).optional(),
  meetingLink: z.string().url().max(500).optional(),
});

// GET /api/bookings/[id] — single booking with interviewer info
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;

    const booking = await db.humanBooking.findUnique({
      where: { id },
      include: {
        interviewer: {
          select: {
            id: true,
            fullName: true,
            fullNameAr: true,
            priceTier: true,
            hourlyRate: true,
            rating: true,
            totalInterviews: true,
            languages: true,
            specialties: true,
          },
        },
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: { ar: 'الحجز غير موجود', en: 'Booking not found' } },
        { status: 404 },
      );
    }

    // Only the booking owner or the interviewer can view
    if (booking.userId !== userId && booking.interviewerId !== userId) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح بالوصول لهذا الحجز', en: 'Not authorized to access this booking' } },
        { status: 403 },
      );
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error('GET /api/bookings/[id] error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء جلب الحجز', en: 'Error fetching booking' } },
      { status: 500 },
    );
  }
}

// PATCH /api/bookings/[id] — update booking status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;
    const userRole = (session.user as Record<string, unknown>).role as string;

    const body = await req.json();
    const parsed = updateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { ar: 'بيانات غير صالحة', en: 'Invalid input', details: parsed.error.issues } },
        { status: 400 },
      );
    }

    const { status, cancelledBy, meetingLink } = parsed.data;

    const booking = await db.humanBooking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json(
        { error: { ar: 'الحجز غير موجود', en: 'Booking not found' } },
        { status: 404 },
      );
    }

    // Authorization: owner or interviewer or admin
    if (booking.userId !== userId && booking.interviewerId !== userId && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 403 },
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (meetingLink) {
      updateData.meetingLink = meetingLink;
    }

    if (status) {
      // Validate transition
      const allowed = VALID_TRANSITIONS[booking.status];
      if (!allowed || !allowed.includes(status)) {
        return NextResponse.json(
          {
            error: {
              ar: `لا يمكن الانتقال من ${booking.status} إلى ${status}`,
              en: `Cannot transition from ${booking.status} to ${status}`,
            },
          },
          { status: 400 },
        );
      }

      // For cancellation, check >24h before scheduled time
      if (status === 'CANCELLED') {
        const hoursUntilScheduled =
          (booking.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursUntilScheduled <= 24) {
          return NextResponse.json(
            {
              error: {
                ar: 'لا يمكن الإلغاء قبل أقل من 24 ساعة من الموعد',
                en: 'Cannot cancel less than 24 hours before the scheduled time',
              },
            },
            { status: 400 },
          );
        }

        updateData.status = 'CANCELLED';
        updateData.cancelledBy = cancelledBy || userId;
        updateData.cancelledAt = new Date();
      } else {
        updateData.status = status;
      }

      // If completing, increment interviewer totalInterviews and totalEarnings
      if (status === 'COMPLETED') {
        await db.interviewer.update({
          where: { id: booking.interviewerId },
          data: {
            totalInterviews: { increment: 1 },
            totalEarnings: { increment: booking.interviewerPayout },
          },
        });
      }
    }

    const updated = await db.humanBooking.update({
      where: { id },
      data: updateData,
      include: {
        interviewer: {
          select: {
            id: true,
            fullName: true,
            fullNameAr: true,
            hourlyRate: true,
          },
        },
      },
    });

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error('PATCH /api/bookings/[id] error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء تحديث الحجز', en: 'Error updating booking' } },
      { status: 500 },
    );
  }
}
