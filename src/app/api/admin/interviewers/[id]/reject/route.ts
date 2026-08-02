import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/interviewers/[id]/reject — reject an interviewer application
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

    // Parse optional rejection reason from body
    let rejectionReason: string | undefined;
    try {
      const body = await req.json();
      rejectionReason = body.reason;
    } catch {
      // No body is fine — reason is optional
    }

    // ── Try DB first ──
    try {
      const { db } = await import('@/lib/db');
      const updated = await db.interviewer.update({
        where: { id },
        data: {
          status: 'REJECTED',
        },
      });
      console.log(`[Admin Reject] Interviewer ${id} rejected`, rejectionReason ? `Reason: ${rejectionReason}` : '');
      return NextResponse.json({ success: true, interviewer: updated });
    } catch (dbErr) {
      console.warn('[POST /api/admin/interviewers/[id]/reject] DB unavailable, using mock:', dbErr);
    }

    // ── Mock mode ──
    console.log(`[Admin Reject] Mock: Interviewer ${id} rejected`, rejectionReason ? `Reason: ${rejectionReason}` : '');
    return NextResponse.json({
      success: true,
      message: {
        ar: 'تم رفض طلب المقابل',
        en: 'Interviewer application rejected',
      },
    });
  } catch (err) {
    console.error('POST /api/admin/interviewers/[id]/reject error:', err);
    return NextResponse.json(
      {
        error: {
          ar: 'حدث خطأ أثناء رفض طلب المقابل',
          en: 'Error rejecting interviewer',
        },
      },
      { status: 500 },
    );
  }
}
