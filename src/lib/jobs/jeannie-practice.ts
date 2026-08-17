/**
 * Jobs board → Jeannie voice coach deep links.
 * Always targets /interview/prep (voice coach), never the text-only prequal engine.
 */

/** Map a free-text job title onto coach config role ids (kebab-case). */
export function inferCoachRoleIdFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (/staff software|staff engineer|principal engineer|principal software/.test(t)) {
    return 'staff-software-engineer';
  }
  if (/civil engineer|structural/.test(t)) return 'civil-engineer';
  if (/mechanical engineer/.test(t)) return 'mechanical-engineer';
  if (/electrical engineer/.test(t)) return 'electrical-engineer';
  if (
    /software|engineer|developer|backend|frontend|full.?stack|devops|sre|mobile|ios|android|qa|platform/.test(
      t,
    )
  ) {
    return 'software-engineer';
  }
  if (/data scientist|data analyst|machine learning|ml engineer|bi analyst|analytics/.test(t)) {
    return 'data-analyst';
  }
  if (/product manager|product owner|\bpm\b/.test(t)) return 'product-manager';
  if (/digital marketing|performance marketing|growth marketing/.test(t)) return 'digital-marketing';
  if (/marketing|growth|brand|seo|content|social media/.test(t)) return 'marketing-manager';
  if (/sales|account executive|account manager|bdm|business development/.test(t)) {
    if (/business development|bdm/.test(t)) return 'business-development';
    return 'sales-executive';
  }
  if (/human resources|\bhr\b|talent|recruiter|people ops/.test(t)) return 'hr-specialist';
  if (/accountant|accounting/.test(t)) return 'accountant';
  if (/finance|controller|fp&a|treasury|financial analyst/.test(t)) return 'finance-analyst';
  if (/customer success|account success|csm\b/.test(t)) return 'customer-success';
  if (/project manager|\bpm\b|pmp/.test(t)) return 'project-manager';
  if (/operations|ops manager/.test(t)) return 'operations-manager';
  if (/supply chain|logistics|procurement/.test(t)) return 'supply-chain';
  if (/ux|ui|product designer/.test(t)) return 'ux-designer';
  if (/graphic|visual design/.test(t)) return 'graphic-designer';
  if (/content writer|copywriter|editor/.test(t)) return 'content-writer';
  if (/nurse|nursing/.test(t)) return 'nurse';
  if (/pharmacist|pharmacy/.test(t)) return 'pharmacist';
  if (/doctor|physician|clinical|healthcare|medical/.test(t)) return 'doctor';
  if (/professor|lecturer|faculty/.test(t)) return 'university-professor';
  if (/teacher|educator|instructor/.test(t)) return 'teacher';
  if (/design/.test(t)) return 'ux-designer';
  if (/business manager|general manager|office manager|branch manager/.test(t)) {
    return 'operations-manager';
  }
  // Closest general business role when nothing matches
  return 'project-manager';
}

export function jeanniePracticePath(opts?: {
  company?: string | null;
  role?: string | null;
  job?: string | null;
}): string {
  const sp = new URLSearchParams();
  const company = opts?.company?.trim();
  const role = opts?.role?.trim();
  const job = opts?.job?.trim();
  if (company) sp.set('company', company.slice(0, 120));
  if (role) sp.set('role', role.slice(0, 160));
  if (job) sp.set('job', job.slice(0, 80));
  const q = sp.toString();
  return q ? `/interview/prep?${q}` : '/interview/prep';
}
