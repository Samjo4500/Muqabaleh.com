import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getOwnedBooking(userId: string, bookingId: string) {
  const interviewer = await db.interviewer.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!interviewer) return null;

  return db.humanBooking.findFirst({
    where: { id: bookingId, interviewerId: interviewer.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      review: { select: { id: true, rating: true } },
    },
  });
}

function serializeBooking(booking: NonNullable<Awaited<ReturnType<typeof getOwnedBooking>>>) {
  let evaluation: Record<string, unknown> | null = null;
  if (booking.interviewerNotes) {
    try {
      evaluation = JSON.parse(booking.interviewerNotes);
    } catch {
      evaluation = { notes: booking.interviewerNotes };
    }
  }

  return {
    id: booking.id,
    status: booking.status,
    scheduledAt: booking.scheduledAt,
    durationMinutes: booking.durationMinutes,
    candidateName: booking.user?.name || booking.user?.email || 'Candidate',
    candidateEmail: booking.user?.email || '',
    candidateNote: booking.candidateNote,
    interviewerRating: booking.interviewerRating,
    evaluation,
    review: booking.review,
  };
}

/** GET one booking owned by the signed-in interviewer (for evaluate UI). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;
    const booking = await getOwnedBooking(userId, id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking: serializeBooking(booking) });
  } catch (err) {
    console.error('[GET /api/interviewer/bookings/:id]', err);
    return NextResponse.json({ error: 'Failed to load booking' }, { status: 500 });
  }
}

const patchSchema = z.object({
  scores: z
    .object({
      content: z.number().int().min(0).max(100),
      clarity: z.number().int().min(0).max(100),
      confidence: z.number().int().min(0).max(100),
      cultural: z.number().int().min(0).max(100),
    })
    .optional(),
  strengths: z.string().max(4000).optional(),
  improvements: z.string().max(4000).optional(),
  recommendation: z.string().max(64).optional(),
  answers: z.array(z.string().max(4000)).max(10).optional(),
  interviewerRating: z.number().int().min(0).max(100).optional().nullable(),
});

/** PATCH evaluation notes for a booking owned by the interviewer. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;
    const booking = await getOwnedBooking(userId, id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const body = patchSchema.parse(await req.json());
    const evaluation = {
      scores: body.scores,
      strengths: body.strengths ?? '',
      improvements: body.improvements ?? '',
      recommendation: body.recommendation ?? '',
      answers: body.answers ?? [],
      updatedAt: new Date().toISOString(),
    };

    let rating = body.interviewerRating;
    if (rating == null && body.scores) {
      const vals = Object.values(body.scores);
      rating = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    }

    const updated = await db.humanBooking.update({
      where: { id: booking.id },
      data: {
        interviewerNotes: JSON.stringify(evaluation),
        ...(rating != null ? { interviewerRating: rating } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        review: { select: { id: true, rating: true } },
      },
    });

    return NextResponse.json({ booking: serializeBooking(updated) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.issues }, { status: 400 });
    }
    console.error('[PATCH /api/interviewer/bookings/:id]', err);
    return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 });
  }
}
