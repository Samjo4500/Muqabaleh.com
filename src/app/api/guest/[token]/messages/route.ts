import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startInterview, generateInterviewResponse, checkRateLimit, evaluateInterview, generateVerificationId } from '@/lib/ai';
import { z } from 'zod';

const guestMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

// POST /api/guest/[token]/messages — guest candidate message flow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    // Find interview by guest token
    const interview = await db.interview.findFirst({
      where: { guestToken: token, mode: 'AI' },
    });

    if (!interview) {
      return NextResponse.json({ error: { ar: 'رابط غير صالح', en: 'Invalid link' } }, { status: 404 });
    }

    // If COMPLETED, don't allow more messages
    if (interview.status === 'COMPLETED') {
      return NextResponse.json({ error: { ar: 'المقابلة مكتملة', en: 'Interview completed' } }, { status: 400 });
    }

    // Rate limit
    if (!checkRateLimit(interview.id)) {
      return NextResponse.json({ error: { ar: 'تم تجاوز الحد. انتظر قليلاً.', en: 'Rate limit exceeded.' } }, { status: 429 });
    }

    // PENDING → start
    if (interview.status === 'PENDING') {
      await db.interview.update({ where: { id: interview.id }, data: { status: 'IN_PROGRESS' } });

      const result = await startInterview(interview.id, {
        interviewerGender: interview.interviewerGender as 'MALE' | 'FEMALE',
        type: interview.type as 'BEHAVIORAL' | 'TECHNICAL',
        industry: interview.industry,
        experience: interview.experience || 'MID',
        language: interview.language as 'AR' | 'EN',
      });

      return NextResponse.json({
        question: result.question,
        questionNumber: result.questionNumber,
        totalQuestions: result.totalQuestions,
        done: false,
      });
    }

    // IN_PROGRESS → generate response
    if (interview.status === 'IN_PROGRESS') {
      const body = await req.json();
      const parsed = guestMessageSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: { ar: 'الرسالة مطلوبة', en: 'Message required' } }, { status: 400 });
      }

      const result = await generateInterviewResponse(interview.id, parsed.data.content, {
        interviewerGender: interview.interviewerGender as 'MALE' | 'FEMALE',
        type: interview.type as 'BEHAVIORAL' | 'TECHNICAL',
        industry: interview.industry,
        experience: interview.experience || 'MID',
        language: interview.language as 'AR' | 'EN',
      });

      if (result.done) {
        await db.interview.update({ where: { id: interview.id }, data: { status: 'COMPLETED' } });

        // Fire-and-forget evaluation (guest interviews don't debit sessions)
        evaluateAndSaveGuest(interview.id, interview.language as 'AR' | 'EN').catch(err => {
          console.error('Guest evaluation failed:', err);
        });

        return NextResponse.json({
          question: result.question,
          questionNumber: result.questionNumber,
          totalQuestions: result.totalQuestions,
          done: true,
        });
      }

      return NextResponse.json({
        question: result.question,
        questionNumber: result.questionNumber,
        totalQuestions: result.totalQuestions,
        done: false,
      });
    }

    return NextResponse.json({ error: { ar: 'حالة غير صالحة', en: 'Invalid status' } }, { status: 400 });
  } catch (err) {
    console.error('Guest message error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ', en: 'Error' } }, { status: 500 });
  }
}

async function evaluateAndSaveGuest(interviewId: string, language: 'AR' | 'EN') {
  try {
    const evaluation = await evaluateInterview(interviewId, language);
    const verificationId = generateVerificationId();
    const expiresAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);

    await db.interview.update({
      where: { id: interviewId },
      data: {
        overallScore: evaluation.overallScore,
        contentScore: evaluation.contentScore,
        clarityScore: evaluation.clarityScore,
        confidenceScore: evaluation.confidenceScore,
        culturalFitScore: evaluation.culturalFitScore,
        feedback: evaluation.feedback,
        strengths: JSON.stringify(evaluation.strengths),
        improvements: JSON.stringify(evaluation.improvements),
        recommendation: evaluation.recommendation,
        verificationId,
        expiresAt,
        sessionDebited: true,
      },
    });
  } catch (err) {
    console.error(`Guest evaluateAndSave failed for ${interviewId}:`, err);
    await db.interview.update({
      where: { id: interviewId },
      data: { status: 'EVALUATION_FAILED' },
    });
  }
}
