import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enforceIpRateLimit } from '@/lib/rate-limit';
import { applyStudent100 } from '@/lib/student100/campaign';

export async function POST(req: NextRequest) {
  const blocked = await enforceIpRateLimit('student100-apply', 8);
  if (blocked) return blocked;

  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: 'signin_required' }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const locale = body.locale === 'en' ? 'en' : 'ar';
  const result = await applyStudent100({
    userId: user.id,
    accountEmail: user.email,
    fullName: body.fullName,
    country: body.country,
    university: body.university,
    major: body.major,
    eligibility: body.eligibility,
    universityEmail: body.universityEmail,
    proofNote: body.proofNote,
    locale,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.code, message: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json({ ok: true, status: result.status });
}
