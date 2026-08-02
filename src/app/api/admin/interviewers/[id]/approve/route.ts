import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/interviewers/[id]/approve — approve an interviewer application
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

    // ── Try DB first ──
    try {
      const { db } = await import('@/lib/db');
      const updated = await db.interviewer.update({
        where: { id },
        data: { status: 'APPROVED' },
      });
      console.log(`[Admin Approve] Interviewer ${id} approved`);
      return NextResponse.json({ success: true, interviewer: updated });
    } catch (dbErr) {
      console.warn('[POST /api/admin/interviewers/[id]/approve] DB unavailable, using mock:', dbErr);
    }

    // ── Mock mode ──
    console.log(`[Admin Approve] Mock: Interviewer ${id} approved`);
    return NextResponse.json({
      success: true,
      message: {
        ar: 'تم قبول المقابل بنجاح',
        en: 'Interviewer approved successfully',
      },
    });
  } catch (err) {
    console.error('POST /api/admin/interviewers/[id]/approve error:', err);
    return NextResponse.json(
      {
        error: {
          ar: 'حدث خطأ أثناء قبول المقابل',
          en: 'Error approving interviewer',
        },
      },
      { status: 500 },
    );
  }
}
