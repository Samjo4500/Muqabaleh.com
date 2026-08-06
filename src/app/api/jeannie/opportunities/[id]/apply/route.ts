import { NextRequest, NextResponse } from 'next/server';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { fileFromForm } from '@/lib/ats/media';
import { applyOpportunity } from '@/lib/jeannie/opportunity-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAtsSession();
  if (!user) return unauthorized();
  const { id } = await params;

  const form = await req.formData();
  const coverLetter = String(form.get('coverLetter') || '').trim() || undefined;
  const cv = await fileFromForm(form, 'cv');

  const result = await applyOpportunity(user.id, id, {
    coverLetter,
    cv: cv || null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    opportunity: result.opportunity,
    appliesLeft: result.appliesLeft,
    mode: result.mode,
  });
}
