import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createDailyRoom } from '@/lib/daily';

const createRoomSchema = z.object({
  bookingId: z.string().uuid(),
});

// POST /api/daily/create-room
// Body: { bookingId: string }
// Auth: requires session (user or interviewer)
// Creates a Daily.co room and stores the URL in the booking
export async function POST(req: NextRequest) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate body
    const body = await req.json();
    const parsed = createRoomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { bookingId } = parsed.data;

    // Check for DAILY_API_KEY
    if (!process.env.DAILY_API_KEY) {
      return NextResponse.json(
        { error: 'Video service is not configured' },
        { status: 503 }
      );
    }

    // Fetch the booking with interviewer relation for authorization check
    const booking = await db.humanBooking.findUnique({
      where: { id: bookingId },
      include: { interviewer: { select: { userId: true } } },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization: session user must be the booking user or the interviewer
    const isBookingUser = session.user.id === booking.userId;
    const isInterviewer =
      booking.interviewerId != null &&
      booking.interviewer?.userId != null &&
      session.user.id === booking.interviewer.userId;

    if (!isBookingUser && !isInterviewer) {
      return NextResponse.json(
        { error: 'You are not authorized to create a room for this booking' },
        { status: 403 }
      );
    }

    // Delegate to shared utility
    const result = await createDailyRoom(bookingId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating Daily.co room:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Booking not found' ? 404
      : message === 'Failed to create video room' ? 502
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
