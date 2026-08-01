import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/interviews/[id]/pdf — generate and return PDF report
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;

    const interview = await db.interview.findFirst({
      where: { id, userId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!interview || interview.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Interview not found or not completed' }, { status: 404 });
    }

    const strengths: string[] = interview.strengths ? JSON.parse(interview.strengths) : [];
    const improvements: string[] = interview.improvements ? JSON.parse(interview.improvements) : [];

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 20;

    // Gold header bar
    doc.setFillColor(212, 168, 67);
    doc.rect(0, 0, pageW, 4, 'F');
    y = 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(212, 168, 67);
    doc.text('MUQABALEH', margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 130);
    doc.text('Interview Performance Report', margin, y);
    y += 10;

    doc.setDrawColor(212, 168, 67);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // Candidate Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Candidate', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${interview.user?.name || interview.guestName || 'Guest'}`, margin, y); y += 6;
    doc.text(`Email: ${interview.user?.email || 'N/A'}`, margin, y); y += 6;
    doc.text(`Industry: ${interview.industry}`, margin, y); y += 6;
    doc.text(`Type: ${interview.type}`, margin, y); y += 6;
    doc.text(`Language: ${interview.language === 'AR' ? 'Arabic' : 'English'}`, margin, y); y += 6;
    doc.text(`Date: ${interview.updatedAt.toISOString().split('T')[0]}`, margin, y); y += 12;

    // Overall Score
    doc.setFillColor(7, 10, 15);
    doc.roundedRect(margin, y - 4, contentW, 22, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(212, 168, 67);
    doc.text(`${interview.overallScore ?? 'N/A'}`, margin + 8, y + 12);

    doc.setFontSize(10);
    doc.setTextColor(180, 180, 190);
    doc.text('/ 100', margin + 30, y + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    const recText = interview.recommendation || 'N/A';
    doc.text(recText, pageW - margin - doc.getTextWidth(recText), y + 12);
    y += 28;

    // Score Breakdown
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Score Breakdown', margin, y);
    y += 8;

    const scores = [
      { label: 'Content', value: interview.contentScore },
      { label: 'Clarity', value: interview.clarityScore },
      { label: 'Confidence', value: interview.confidenceScore },
      { label: 'Cultural Fit', value: interview.culturalFitScore },
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    scores.forEach(({ label, value }) => {
      const score = value ?? 0;
      doc.setTextColor(80, 80, 80);
      doc.text(`${label}`, margin, y);

      const barX = margin + 50;
      const barW = contentW - 100;
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(barX, y - 3, barW, 4, 2, 2, 'F');

      const fillW = (score / 100) * barW;
      const c = score >= 70 ? [34, 197, 94] : score >= 50 ? [234, 179, 8] : [239, 68, 68];
      doc.setFillColor(c[0], c[1], c[2]);
      doc.roundedRect(barX, y - 3, fillW, 4, 2, 2, 'F');

      doc.setTextColor(50, 50, 50);
      doc.text(`${score}`, pageW - margin - 10, y);
      y += 10;
    });
    y += 5;

    // Feedback
    if (interview.feedback) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text('Feedback', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(interview.feedback, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 10;
    }

    // Strengths
    if (strengths.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(34, 197, 94);
      doc.text('Strengths', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      strengths.forEach((s) => {
        const sl = doc.splitTextToSize(`+ ${s}`, contentW - 5);
        doc.text(sl, margin + 5, y);
        y += sl.length * 5 + 2;
      });
      y += 5;
    }

    // Improvements
    if (improvements.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(234, 179, 8);
      doc.text('Areas for Improvement', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      improvements.forEach((s) => {
        const sl = doc.splitTextToSize(`- ${s}`, contentW - 5);
        doc.text(sl, margin + 5, y);
        y += sl.length * 5 + 2;
      });
      y += 5;
    }

    // Verification
    if (interview.verificationId) {
      y = Math.max(y + 10, 250);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageW - margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 150);
      doc.text(`Verification ID: ${interview.verificationId}`, margin, y); y += 5;
      if (interview.expiresAt) {
        doc.text(`Valid until: ${interview.expiresAt.toISOString().split('T')[0]}`, margin, y);
      }
      y += 5;
      doc.text('Verify at: muqabaleh-com.vercel.app', margin, y);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 170);
    doc.text('Muqabaleh - AI-Powered Interview Preparation Platform', pageW / 2, footerY, { align: 'center' });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="muqabaleh-report-${id.slice(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
