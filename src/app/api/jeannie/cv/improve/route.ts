import { NextRequest, NextResponse } from 'next/server';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { improveCvDraft } from '@/lib/ai/cv-studio';

export async function POST(req: NextRequest) {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const body = (await req.json()) as {
    sourceText?: string;
    targetRole?: string;
    language?: 'en' | 'ar' | 'both';
  };

  const result = await improveCvDraft({
    userId: user.id,
    sourceText: body.sourceText || '',
    targetRole: body.targetRole,
    language: body.language,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ document: result.document, mode: result.mode });
}
