/** Client-side onboarding persistence (no DB). */

export function tourStorageKey(tenantSlug: string) {
  return `mq-console-tour:v1:${tenantSlug}`;
}

/** Durable demo-clear flag (cookie name + localStorage key). Survives Vercel cold starts. */
export function demoClearedCookieName(tenantSlug: string) {
  return `mq-demo-cleared-${tenantSlug}`;
}

export function demoClearedStorageKey(tenantSlug: string) {
  return `mq-console-demo-cleared:v1:${tenantSlug}`;
}

export function readDemoCleared(tenantSlug: string): boolean {
  try {
    return localStorage.getItem(demoClearedStorageKey(tenantSlug)) === '1';
  } catch {
    return false;
  }
}

export function markDemoCleared(tenantSlug: string) {
  try {
    localStorage.setItem(demoClearedStorageKey(tenantSlug), '1');
  } catch {
    /* ignore */
  }
}

export function checklistStorageKey(tenantSlug: string) {
  return `mq-console-checklist:v1:${tenantSlug}`;
}

export type ChecklistItemId =
  | 'logo'
  | 'job'
  | 'invite'
  | 'passport'
  | 'questions';

export type ChecklistState = Partial<Record<ChecklistItemId, boolean>>;

export function readTourDone(tenantSlug: string): boolean {
  try {
    return localStorage.getItem(tourStorageKey(tenantSlug)) === '1';
  } catch {
    return true;
  }
}

export function markTourDone(tenantSlug: string) {
  try {
    localStorage.setItem(tourStorageKey(tenantSlug), '1');
  } catch {
    /* ignore */
  }
}

export function readChecklist(tenantSlug: string): ChecklistState {
  try {
    const raw = localStorage.getItem(checklistStorageKey(tenantSlug));
    if (!raw) return {};
    return JSON.parse(raw) as ChecklistState;
  } catch {
    return {};
  }
}

export function writeChecklist(tenantSlug: string, state: ChecklistState) {
  try {
    localStorage.setItem(checklistStorageKey(tenantSlug), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function isDemoPassport(tags?: string[] | null) {
  return Boolean(tags?.includes('demo'));
}
