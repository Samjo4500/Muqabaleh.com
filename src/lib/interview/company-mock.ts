/**
 * Company-specific mock context — injected from job pages into Jeannie practice.
 * Never used for auto-apply; practice + feedback only.
 */

export type CompanyMockContext = {
  companyName: string;
  roleTitle: string;
  jobId?: string | null;
  jobDescription?: string | null;
};

/** Map free-text job titles to bank role categories. */
export function inferRoleFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (
    /software|engineer|developer|backend|frontend|full.?stack|devops|sre|mobile|ios|android|qa|platform/.test(
      t,
    )
  ) {
    return 'software_engineer';
  }
  if (/data scientist|data analyst|machine learning|ml engineer|bi analyst|analytics/.test(t)) {
    return 'data_analyst';
  }
  if (/product manager|product owner|pm\b/.test(t)) return 'product_manager';
  if (/marketing|growth|brand|seo|content|social media/.test(t)) return 'marketing_manager';
  if (/sales|account executive|account manager|bdm|business development/.test(t)) return 'sales';
  if (/human resources|\bhr\b|talent|recruiter|people ops/.test(t)) return 'hr';
  if (/finance|accountant|accounting|controller|fp&a|treasury/.test(t)) return 'finance';
  if (/operations|ops manager|supply chain|logistics/.test(t)) return 'operations';
  if (/design|ux|ui|product designer|graphic/.test(t)) return 'design';
  if (/nurse|doctor|clinical|healthcare|medical|pharmacist/.test(t)) return 'healthcare';
  if (/legal|counsel|compliance|lawyer|attorney/.test(t)) return 'legal';
  if (/consultant|consulting|strategy/.test(t)) return 'consulting';
  return 'general';
}

export function sanitizeCompanyMock(input: unknown): CompanyMockContext | null {
  if (!input || typeof input !== 'object') return null;
  const o = input as Record<string, unknown>;
  const companyName = String(o.companyName || '').trim().slice(0, 120);
  const roleTitle = String(o.roleTitle || '').trim().slice(0, 160);
  if (!companyName || !roleTitle) return null;
  return {
    companyName,
    roleTitle,
    jobId: o.jobId ? String(o.jobId).slice(0, 80) : null,
    jobDescription: o.jobDescription
      ? String(o.jobDescription).replace(/\s+/g, ' ').trim().slice(0, 300)
      : null,
  };
}
