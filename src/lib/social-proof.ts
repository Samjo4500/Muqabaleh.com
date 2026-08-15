import { db } from '@/lib/db';
import {
  listRegistryCompanies,
  listRegistryRoles,
} from '@/lib/interview-guides/registry';

export type SocialProofStats = {
  interviews: number | null;
  companies: number | null;
  guides: number | null;
};

function positive(n: number): number | null {
  return n > 0 ? n : null;
}

export async function loadSocialProofStats(): Promise<SocialProofStats | null> {
  let interviews = 0;
  let companies = 0;
  let guides = 0;

  try {
    const [funnel, interviewRows, sessions] = await Promise.all([
      db.funnelEvent.count({ where: { name: 'interview_started' } }).catch(() => 0),
      db.interview.count().catch(() => 0),
      db.interviewSession.count().catch(() => 0),
    ]);
    interviews = Math.max(funnel, interviewRows, sessions);
  } catch {
    interviews = 0;
  }

  try {
    companies = await db.listedCompany.count({ where: { isActive: true } });
  } catch {
    companies = 0;
  }

  try {
    const [c, r] = await Promise.all([listRegistryCompanies(), listRegistryRoles()]);
    guides = c.length + r.length;
  } catch {
    guides = 0;
  }

  const stats: SocialProofStats = {
    interviews: positive(interviews),
    companies: positive(companies),
    guides: positive(guides),
  };
  if (!stats.interviews && !stats.companies && !stats.guides) return null;
  return stats;
}
