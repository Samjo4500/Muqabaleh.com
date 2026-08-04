/**
 * Daily.co shared utility — room creation logic used by both
 * the authenticated API route and internal server-side calls (e.g. PayPal capture).
 */

import { db } from '@/lib/db';

interface CreateRoomResult {
  roomUrl: string;
  roomName: string;
}

/**
 * Create a Daily.co room for a given booking (or return the existing one).
 * This function has NO auth — callers must verify authorization themselves.
 */
export async function createDailyRoom(bookingId: string): Promise<CreateRoomResult> {
  // Fetch the booking
  const booking = await db.humanBooking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      scheduledAt: true,
      dailyRoomUrl: true,
      dailyRoomName: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // If room already exists, return it
  if (booking.dailyRoomUrl && booking.dailyRoomName) {
    return { roomUrl: booking.dailyRoomUrl, roomName: booking.dailyRoomName };
  }

  // Calculate timestamps
  const sessionStart = new Date(booking.scheduledAt).getTime();
  const now = Date.now();

  // nbf: 15 minutes before scheduled start, but at least now
  const nbfRaw = sessionStart - 15 * 60 * 1000;
  const nbf = nbfRaw > now ? Math.floor(nbfRaw / 1000) : Math.floor(now / 1000);

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
    throw new Error('Failed to create video room');
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

  return { roomUrl: roomData.url, roomName: roomData.name };
}
