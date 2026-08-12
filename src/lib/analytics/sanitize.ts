const MAX_PATH = 500;
const MAX_QUERY = 500;
const MAX_TITLE = 300;
const MAX_REF = 800;
const MAX_HREF = 800;
const MAX_TEXT = 120;
const MAX_UA = 500;

export function clip(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}

export function normalizePath(path: string | null | undefined): string {
  if (!path || typeof path !== 'string') return '/';
  let p = path.split('?')[0]?.split('#')[0] || '/';
  if (!p.startsWith('/')) p = `/${p}`;
  // strip locale prefix for aggregation
  p = p.replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return clip(p, MAX_PATH) || '/';
}

export function sanitizeQuery(raw: unknown): string | null {
  const q = clip(raw, MAX_QUERY);
  if (!q) return null;
  // drop obvious secrets
  return q
    .replace(/(password|token|secret|authorization|cookie)=([^&]*)/gi, '$1=redacted')
    .slice(0, MAX_QUERY);
}

export function limits() {
  return { MAX_PATH, MAX_QUERY, MAX_TITLE, MAX_REF, MAX_HREF, MAX_TEXT, MAX_UA };
}

export { MAX_PATH, MAX_QUERY, MAX_TITLE, MAX_REF, MAX_HREF, MAX_TEXT, MAX_UA };
