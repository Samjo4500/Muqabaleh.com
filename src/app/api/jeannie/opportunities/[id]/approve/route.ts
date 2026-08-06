import { NextResponse } from 'next/server';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { approveOpportunity } from '@/lib/jeannie/opportunity-service';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAtsSession();
  if (!user) return unauthorized();
  const { id } = await params;
  const result = await approveOpportunity(user.id, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ opportunity: result.opportunity });
}
