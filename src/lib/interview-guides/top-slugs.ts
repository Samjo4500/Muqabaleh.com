/** Ranked (usually by job count) first, then catalog fallback. */
export function pickTopSlugs(
  ranked: string[],
  fallback: string[],
  limit: number,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const slug of [...ranked, ...fallback]) {
    const id = slug.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= limit) break;
  }
  return out;
}

export const BUILD_TIME_COMPANY_GUIDE_LIMIT = 20;
export const BUILD_TIME_ROLE_GUIDE_LIMIT = 10;
