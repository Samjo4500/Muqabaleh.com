import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMyStudent100Claim, getStudent100Status } from '@/lib/student100/campaign';

export async function GET() {
  const campaign = await getStudent100Status();
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const mine = userId ? await getMyStudent100Claim(userId) : null;
  return NextResponse.json({
    ...campaign,
    signedIn: Boolean(userId),
    mine,
  });
}
