import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { BookingStatus } from '@/lib/enums';
import { z } from 'zod';

const VALID_TRANSITIONS: Record<string, string[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.RESCHEDULED],
  [BookingStatus.CONFIRMED]: [
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
    BookingStatus.RESCHEDULED,
  ],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
};

const updateBookingSchema = z.object({
  status: z
    .enum([
      BookingStatus.CONFIRMED,
      BookingStatus.IN_PROGRESS,
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
      BookingStatus.RESCHEDULED,
    ])
    .optional(),
  cancelledBy: z.string().max(50).optional(),
  meetingLink: z.string().url().max(500).optional(),
});

async function resolveInterviewerForUser(userId: string) {
  return db.interviewer.findUnique({
    where: { userId },
    select: { id: true },
  });
}

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
    const userRole = (session.user as Record<string, unknown>).role as string;

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

    const interviewer = await resolveInterviewerForUser(userId);
    const isOwner = booking.userId === userId;
    const isAssignedInterviewer = !!interviewer && booking.interviewerId === interviewer.id;
    const isAdmin = userRole === 'SUPER_ADMIN';

    if (!isOwner && !isAssignedInterviewer && !isAdmin) {
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

    const interviewer = await resolveInterviewerForUser(userId);
    const isOwner = booking.userId === userId;
    const isAssignedInterviewer = !!interviewer && booking.interviewerId === interviewer.id;
    const isAdmin = userRole === 'SUPER_ADMIN';

    if (!isOwner && !isAssignedInterviewer && !isAdmin) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 403 },
      );
    }

    // Candidates may only cancel or reschedule
    if (isOwner && !isAssignedInterviewer && !isAdmin) {
      if (
        status &&
        status !== BookingStatus.CANCELLED &&
        status !== BookingStatus.RESCHEDULED
      ) {
        return NextResponse.json(
          {
            error: {
              ar: 'يمكن للمرشح فقط الإلغاء أو إعادة الجدولة',
              en: 'Candidates may only cancel or reschedule',
            },
          },
          { status: 403 },
        );
      }
    }

    // COMPLETED only for assigned interviewer or admin
    // (Verified Daily/PayPal webhooks complete bookings via their own routes)
    if (status === BookingStatus.COMPLETED && !isAssignedInterviewer && !isAdmin) {
      return NextResponse.json(
        {
          error: {
            ar: 'فقط المحاور أو المسؤول يمكنه إكمال الحجز',
            en: 'Only the assigned interviewer or an admin can complete a booking',
          },
        },
        { status: 403 },
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (meetingLink) {
      if (!isAssignedInterviewer && !isAdmin) {
        return NextResponse.json(
          { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
          { status: 403 },
        );
      }
      updateData.meetingLink = meetingLink;
    }

    if (status) {
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

      if (status === BookingStatus.CANCELLED) {
        const hoursUntilScheduled =
          (booking.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursUntilScheduled <= 24 && !isAdmin) {
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

        updateData.status = BookingStatus.CANCELLED;
        updateData.cancelledBy = cancelledBy || userId;
        updateData.cancelledAt = new Date();
      } else {
        updateData.status = status;
      }

      if (status === BookingStatus.COMPLETED) {
        if (!booking.interviewerId) {
          return NextResponse.json(
            {
              error: {
                ar: 'لا يوجد محاور مرتبط بهذا الحجز',
                en: 'Booking has no assigned interviewer',
              },
            },
            { status: 400 },
          );
        }
        updateData.earnings = booking.interviewerPayout;
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
