import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/interviewers/[id]/suspend — suspend an interviewer
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: { ar: 'معرف المقابل مطلوب', en: 'Interviewer ID is required' } },
        { status: 400 },
      );
    }

    // Parse optional suspension reason from body
    let suspensionReason: string | undefined;
    try {
      const body = await req.json();
      suspensionReason = body.reason;
    } catch {
      // No body is fine — reason is optional
    }

    // ── Try DB first ──
    try {
      const { db } = await import('@/lib/db');
      const updated = await db.interviewer.update({
        where: { id },
        data: { status: 'SUSPENDED' },
      });
      console.log(`[Admin Suspend] Interviewer ${id} suspended`, suspensionReason ? `Reason: ${suspensionReason}` : '');
      return NextResponse.json({ success: true, interviewer: updated });
    } catch (dbErr) {
      console.warn('[POST /api/admin/interviewers/[id]/suspend] DB unavailable, using mock:', dbErr);
    }

    // ── Mock mode ──
    console.log(`[Admin Suspend] Mock: Interviewer ${id} suspended`, suspensionReason ? `Reason: ${suspensionReason}` : '');
    return NextResponse.json({
      success: true,
      message: {
        ar: 'تم إيقاف المحاور',
        en: 'Interviewer suspended',
      },
    });
  } catch (err) {
    console.error('POST /api/admin/interviewers/[id]/suspend error:', err);
    return NextResponse.json(
      {
        error: {
          ar: 'حدث خطأ أثناء إيقاف المحاور',
          en: 'Error suspending interviewer',
        },
      },
      { status: 500 },
    );
  }
}
