import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDemoQuestions, type Role, LEVEL_MAP } from '@/lib/interview-questions';

const IS_DEMO = process.env.DEMO_MODE === 'true';

// In-memory demo state
const demoInterviews = new Map<string, {
  id: string;
  language: string;
  status: string;
  messageCount: number;
  questions: string[];
}>();

// Map form values to roles
const ROLE_FROM_FORM: Record<string, Role> = {
  sales: 'SALES_MANAGER', marketing: 'MARKETING_SPECIALIST',
  hr: 'HR_MANAGER', it: 'SOFTWARE_ENGINEER',
  finance: 'ACCOUNTANT', engineering: 'PROJECT_MANAGER',
  operations: 'OPERATIONS_MANAGER', design: 'GRAPHIC_DESIGNER',
  data: 'DATA_ANALYST', customer_service: 'CUSTOMER_SERVICE',
};

const INDUSTRY_FROM_FORM: Record<string, string> = {
  it: 'TECH', finance: 'FINTECH', medicine: 'HEALTHCARE',
  engineering: 'IT', education: 'TECH', marketing: 'RETAIL',
  sales: 'RETAIL', hr: 'TECH', operations: 'MANUFACTURING',
  design: 'TECH', data: 'FINTECH', customer_service: 'TELECOM',
};

// POST /api/guest/interview — create a guest (demo) interview
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const language = body.language === 'en' ? 'EN' : 'AR';
    const guestToken = crypto.randomBytes(24).toString('hex');

    // Determine role and industry from request
    const formIndustry = body.industry || 'it';
    const formExperience = body.experience || 'mid';
    const role = ROLE_FROM_FORM[formIndustry] || 'SOFTWARE_ENGINEER';
    const qIndustry = INDUSTRY_FROM_FORM[formIndustry];
    const level = LEVEL_MAP[formExperience.toUpperCase()] || 'MID';
    const questions = getDemoQuestions(role, level, qIndustry, language);

    // DEMO_MODE: create in-memory interview without database
    if (IS_DEMO) {
      const demoId = `demo-${crypto.randomUUID()}`;
      demoInterviews.set(guestToken, {
        id: demoId,
        language,
        status: 'PENDING',
        messageCount: 0,
        questions,
      });
      return NextResponse.json(
        { token: guestToken, interviewId: demoId, demoMode: true },
        { status: 201 },
      );
    }

    // Production: use database
    const { db } = await import('@/lib/db');
    const interview = await db.interview.create({
      data: {
        mode: 'AI',
        type: 'BEHAVIORAL',
        industry: formIndustry.toUpperCase(),
        experience: formExperience.toUpperCase(),
        language,
        interviewerGender: 'MALE',
        guestToken,
        guestName: 'Demo Candidate',
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { token: guestToken, interviewId: interview.id, demoMode: false },
      { status: 201 },
    );
  } catch (err) {
    console.error('POST /api/guest/interview error:', err);

    // Graceful fallback: if DB is not configured, offer demo mode
    if (!process.env.DATABASE_URL) {
      const guestToken = crypto.randomBytes(24).toString('hex');
      const demoId = `demo-${crypto.randomUUID()}`;
      const defaultQs = getDemoQuestions('SOFTWARE_ENGINEER', 'MID', 'TECH', 'AR');
      demoInterviews.set(guestToken, {
        id: demoId,
        language: 'AR',
        status: 'PENDING',
        messageCount: 0,
        questions: defaultQs,
      });
      return NextResponse.json(
        { token: guestToken, interviewId: demoId, demoMode: true, fallback: true },
        { status: 201 },
      );
    }

    return NextResponse.json(
      { error: { ar: 'حدث خطأ', en: 'Error' } },
      { status: 500 },
    );
  }
}

// Export for use by messages route
export { demoInterviews };
