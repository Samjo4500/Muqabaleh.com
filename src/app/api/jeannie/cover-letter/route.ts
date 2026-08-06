import { NextRequest, NextResponse } from 'next/server';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { generateCoverLetter } from '@/lib/ai/cover-letter';

export async function POST(req: NextRequest) {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const body = (await req.json()) as {
    companyName?: string;
    roleTitle?: string;
    jobSummary?: string;
    candidateSummary?: string;
    language?: 'en' | 'ar' | 'both';
    opportunityId?: string;
  };

  const result = await generateCoverLetter({
    userId: user.id,
    companyName: body.companyName || '',
    roleTitle: body.roleTitle || '',
    jobSummary: body.jobSummary,
    candidateSummary: body.candidateSummary,
    language: body.language,
    opportunityId: body.opportunityId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ document: result.document, mode: result.mode });
}
