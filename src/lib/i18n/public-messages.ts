/**
 * Marketing pages only need a slice of the locale catalog.
 * Shipping admin/app/console strings on / and /jobs is a large JS cost.
 * Authenticated shells re-provide the full catalog via FullMessages.
 */

export const PUBLIC_MESSAGE_NAMESPACES = [
  'common',
  'nav',
  'landing',
  'about',
  'business',
  'interviewers',
  'joinInterviewer',
  'pricing',
  'verify',
  'auth',
  'legal',
  'support',
  'errors',
  'brand',
  'paypal',
  'humanInterviews',
  'apply',
  'booking',
  'optIn',
  'blog',
  'partnersMarketing',
  'employers',
  'demo',
] as const;

export type PublicMessageNamespace = (typeof PUBLIC_MESSAGE_NAMESPACES)[number];

export function pickPublicMessages<T extends Record<string, unknown>>(
  all: T,
): Partial<T> {
  const picked: Record<string, unknown> = {};
  for (const key of PUBLIC_MESSAGE_NAMESPACES) {
    if (key in all) {
      picked[key] = all[key];
    }
  }
  return picked as Partial<T>;
}
