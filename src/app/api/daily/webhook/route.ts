import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * Verify Daily.co webhook signature.
 * Daily sends X-Webhook-Signature + X-Webhook-Timestamp (HMAC-SHA256 over
 * `${timestamp}.${rawBody}`, secret is base64-encoded).
 * Also accepts X-Daily-Signature as an alias when present.
 */
function verifyDailySignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.DAILY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Daily] DAILY_WEBHOOK_SECRET is not configured');
    return false;
  }

  const signature =
    headers.get('x-daily-signature') || headers.get('x-webhook-signature');
  const timestamp = headers.get('x-webhook-timestamp');

  if (!signature) {
    return false;
  }

  try {
    // Daily docs: base64-decode the hmac secret, sign `${timestamp}.${body}`
    const signedPayload = timestamp ? `${timestamp}.${rawBody}` : rawBody;
    let key: Buffer;
    try {
      key = Buffer.from(secret, 'base64');
      // If secret wasn't valid base64 of meaningful length, fall back to raw utf8
      if (key.length === 0) key = Buffer.from(secret, 'utf8');
    } catch {
      key = Buffer.from(secret, 'utf8');
    }

    const computed = crypto
      .createHmac('sha256', key)
      .update(signedPayload)
      .digest('base64');

    const a = Buffer.from(computed);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    console.error('[Daily] Signature verification error:', err);
    return false;
  }
}

// POST /api/daily/webhook
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!verifyDailySignature(rawBody, req.headers)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
          const booking = await db.humanBooking.findFirst({
            where: { dailyRoomName: roomName },
            include: { interviewer: true },
          });

          if (booking && booking.status !== 'COMPLETED') {
            const participantCount: number = payload.participant_count ?? 0;

            if (participantCount === 0) {
              await db.humanBooking.update({
                where: { id: booking.id },
                data: {
                  status: 'COMPLETED',
                  earnings: booking.interviewerPayout,
                },
              });

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
            }
          }
        } catch (dbError) {
          console.error('Error processing participant-left event:', dbError);
        }
      }
    }

    // Handle recording events to store recording URL
    if (eventType.includes('recording') && payload.recording_url) {
      const roomName: string | undefined = payload.room_name;

      if (roomName && roomName.startsWith('muqabaleh-')) {
        try {
          await db.humanBooking.updateMany({
            where: { dailyRoomName: roomName },
            data: {
              recordingUrl: payload.recording_url,
            },
          });
        } catch (dbError) {
          console.error('Error storing recording URL:', dbError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Daily.co webhook:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
