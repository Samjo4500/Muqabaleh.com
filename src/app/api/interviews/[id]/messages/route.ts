import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { startInterview, generateInterviewResponse, checkRateLimit, evaluateInterview, generateVerificationId } from '@/lib/ai';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
});

// POST /api/interviews/[id]/messages — send candidate message, get AI response
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { ar: 'يجب تسجيل الدخول', en: 'Login required' } }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;

    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { ar: 'الرسالة مطلوبة', en: 'Message is required' } }, { status: 400 });
    }

    // Rate limit
    if (!checkRateLimit(id)) {
      return NextResponse.json({ error: { ar: 'تم تجاوز الحد المسموح. يرجى الانتظار قليلاً.', en: 'Rate limit exceeded. Please wait.' } }, { status: 429 });
    }

    // Find interview
    const interview = await db.interview.findFirst({
      where: { id, userId, mode: 'AI' },
    });

    if (!interview) {
      return NextResponse.json({ error: { ar: 'المقابلة غير موجودة', en: 'Interview not found' } }, { status: 404 });
    }

    // If PENDING → start interview (first message is the greeting)
    if (interview.status === 'PENDING') {
      await db.interview.update({ where: { id }, data: { status: 'IN_PROGRESS' } });

      const result = await startInterview(id, {
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

    // If IN_PROGRESS → generate response
    if (interview.status === 'IN_PROGRESS') {
      const result = await generateInterviewResponse(id, parsed.data.content, {
        interviewerGender: interview.interviewerGender as 'MALE' | 'FEMALE',
        type: interview.type as 'BEHAVIORAL' | 'TECHNICAL',
        industry: interview.industry,
        experience: interview.experience || 'MID',
        language: interview.language as 'AR' | 'EN',
      });

      // If done → trigger evaluation
      if (result.done) {
        await db.interview.update({
          where: { id },
          data: { status: 'COMPLETED' },
        });

        // Fire-and-forget evaluation
        evaluateAndSave(id, interview.language as 'AR' | 'EN', userId).catch(err => {
          console.error('Background evaluation failed:', err);
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

    // COMPLETED or other status
    return NextResponse.json({ error: { ar: 'المقابلة مكتملة بالفعل', en: 'Interview already completed' } }, { status: 400 });
  } catch (err) {
    console.error('POST /api/interviews/[id]/messages error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ أثناء معالجة الرسالة', en: 'Error processing message' } }, { status: 500 });
  }
}

// ─── Background Evaluation + Session Debit ───
async function evaluateAndSave(interviewId: string, language: 'AR' | 'EN', userId: string) {
  try {
    const evaluation = await evaluateInterview(interviewId, language);

    const verificationId = generateVerificationId();
    const expiresAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000); // 2 years

    // Save evaluation results + debit session (atomic transaction)
    await db.$transaction(async (tx) => {
      // Update interview with scores
      await tx.interview.update({
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

      // Debit session only if not already debited
      const interview = await tx.interview.findUnique({ where: { id: interviewId } });
      if (interview?.userId && !interview.sessionDebited) {
        await tx.user.update({
          where: { id: interview.userId },
          data: { sessionsLeft: { decrement: 1 } },
        });
      }
    });

  } catch (err) {
    console.error(`evaluateAndSave failed for ${interviewId}:`, err);
    // Mark as evaluation failed so user can retry
    await db.interview.update({
      where: { id: interviewId },
      data: { status: 'EVALUATION_FAILED' },
    });
  }
}
