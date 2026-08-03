import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/daily/webhook
// Daily.co sends events here
export async function POST(req: NextRequest) {
  // Always return 200 quickly — Daily.co retries on non-200
  // Process the event asynchronously

  try {
    // Read raw body (for future signature verification)
    const rawBody = await req.text();
    // TODO: Verify Daily.co signature for production
    // For MVP, just log a warning
    console.warn('Daily.co webhook received without signature verification');

    const payload = JSON.parse(rawBody);
    const eventType: string = payload.event ?? '';

    // Handle participant-left events to mark bookings as completed
    if (
      eventType.startsWith('participant-left') ||
      eventType.startsWith('participant.left')
    ) {
      const roomName: string | undefined = payload.room_name;

      if (roomName && roomName.startsWith('muqabaleh-')) {
        try {
          // Find the booking by daily room name
          const booking = await db.humanBooking.findFirst({
            where: { dailyRoomName: roomName },
            include: { interviewer: true },
          });

          if (booking && booking.status !== 'COMPLETED') {
            // Check if all participants have left
            // The participant-left event means someone left;
            // we check current participant count from the payload
            const participantCount: number = payload.participant_count ?? 0;

            if (participantCount === 0) {
              // All participants have left — mark as completed
              await db.humanBooking.update({
                where: { id: booking.id },
                data: { status: 'COMPLETED' },
              });

              // Increment interviewer stats if interviewer exists
              if (booking.interviewerId) {
                await db.interviewer.update({
                  where: { id: booking.interviewerId },
                  data: {
                    totalInterviews: {
                      increment: 1,
                    },
                  },
                });
              }

              console.log(
                `Booking ${booking.id} marked as COMPLETED — all participants left`
              );
            }
          }
        } catch (dbError) {
          console.error('Error processing participant-left event:', dbError);
        }
      }
    }

    // Handle recording events to store recording URL
    if (
      eventType.includes('recording') &&
      payload.recording_url
    ) {
      const roomName: string | undefined = payload.room_name;

      if (roomName && roomName.startsWith('muqabaleh-')) {
        try {
          await db.humanBooking.updateMany({
            where: { dailyRoomName: roomName },
            data: {
              recordingUrl: payload.recording_url,
            },
          });

          console.log(
            `Recording URL stored for room ${roomName}: ${payload.recording_url}`
          );
        } catch (dbError) {
          console.error('Error storing recording URL:', dbError);
        }
      }
    }
  } catch (error) {
    // Log but don't throw — we must always return 200
    console.error('Error processing Daily.co webhook:', error);
  }

  return NextResponse.json({ received: true });
}
