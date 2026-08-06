import { NextRequest, NextResponse } from 'next/server';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { getOrCreateJeannieProfile, updateJeannieProfile } from '@/lib/jeannie/profile';

export async function GET() {
  const user = await getAtsSession();
  if (!user) return unauthorized();
  const profile = await getOrCreateJeannieProfile(user.id);
  return NextResponse.json({ profile });
}

export async function PATCH(req: NextRequest) {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const body = (await req.json()) as {
    targetRoles?: string[];
    targetCities?: string[];
    targetCountries?: string[];
    seniority?: string | null;
    languages?: string[];
    minSalary?: number | null;
    workModes?: string[];
    notes?: string | null;
    isActive?: boolean;
  };

  const profile = await updateJeannieProfile(user.id, body);
  return NextResponse.json({ profile });
}
