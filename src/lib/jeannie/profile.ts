import { db } from '@/lib/db';

export type JeannieTargetsInput = {
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

function cleanList(values?: string[]) {
  if (!values) return undefined;
  return values.map((v) => v.trim()).filter(Boolean).slice(0, 20);
}

export async function getOrCreateJeannieProfile(userId: string) {
  const existing = await db.jeannieProfile.findUnique({ where: { userId } });
  if (existing) return existing;

  const pool = await db.candidatePool.findUnique({ where: { userId } });
  return db.jeannieProfile.create({
    data: {
      userId,
      targetRoles: pool?.desiredRole ? [pool.desiredRole] : pool?.role ? [pool.role] : [],
      seniority: pool?.level || null,
      isActive: true,
    },
  });
}

export async function updateJeannieProfile(userId: string, input: JeannieTargetsInput) {
  await getOrCreateJeannieProfile(userId);
  return db.jeannieProfile.update({
    where: { userId },
    data: {
      ...(input.targetRoles ? { targetRoles: cleanList(input.targetRoles) } : {}),
      ...(input.targetCities ? { targetCities: cleanList(input.targetCities) } : {}),
      ...(input.targetCountries ? { targetCountries: cleanList(input.targetCountries) } : {}),
      ...(input.languages ? { languages: cleanList(input.languages) } : {}),
      ...(input.workModes ? { workModes: cleanList(input.workModes) } : {}),
      ...(input.seniority !== undefined ? { seniority: input.seniority } : {}),
      ...(input.minSalary !== undefined ? { minSalary: input.minSalary } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
}
