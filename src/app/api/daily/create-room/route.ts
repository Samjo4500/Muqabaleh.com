import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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

    // Fetch the booking with interviewer relation
    const booking = await db.humanBooking.findUnique({
      where: { id: bookingId },
      include: { interviewer: { select: { userId: true, fullName: true } } },
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
      booking.interviewer.userId !== 'pending' &&
      session.user.id === booking.interviewer.userId;

    if (!isBookingUser && !isInterviewer) {
      return NextResponse.json(
        { error: 'You are not authorized to create a room for this booking' },
        { status: 403 }
      );
    }

    // If room already exists, return it
    if (booking.dailyRoomUrl) {
      return NextResponse.json({
        roomUrl: booking.dailyRoomUrl,
        roomName: booking.dailyRoomName,
      });
    }

    // Calculate timestamps
    const sessionStart = new Date(booking.scheduledAt).getTime();
    const now = Date.now();

    // nbf: 15 minutes before scheduled start, but at least now
    const nbfRaw = sessionStart - 15 * 60 * 1000;
    const nbf =
      nbfRaw > now ? Math.floor(nbfRaw / 1000) : Math.floor(now / 1000);

    // exp: 2 hours after scheduled start
    const exp = Math.floor((sessionStart + 2 * 60 * 60 * 1000) / 1000);

    const roomName = 'muqabaleh-' + bookingId.slice(0, 8);

    // Call Daily.co API
    const dailyResponse = await fetch('https://api.daily.co/v1/rooms/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        max_participants: 2,
        nbf,
        exp,
        enable_screenshare: false,
        enable_chat: true,
        start_audio_off: false,
        start_video_off: false,
        enable_recording: 'cloud',
      }),
    });

    if (!dailyResponse.ok) {
      const errorBody = await dailyResponse.text();
      console.error('Daily.co API error:', dailyResponse.status, errorBody);
      return NextResponse.json(
        { error: 'Failed to create video room' },
        { status: 502 }
      );
    }

    const roomData = await dailyResponse.json();

    // Store the room info in the booking
    await db.humanBooking.update({
      where: { id: bookingId },
      data: {
        dailyRoomUrl: roomData.url,
        dailyRoomName: roomData.name,
        provider: 'DAILY',
      },
    });

    return NextResponse.json({
      roomUrl: roomData.url,
      roomName: roomData.name,
    });
  } catch (error) {
    console.error('Error creating Daily.co room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
