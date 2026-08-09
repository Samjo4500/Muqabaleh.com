import { timingSafeEqual } from 'crypto';

/** Constant-time string compare for secrets. Rejects empty expected secrets. */
export function secretsMatch(
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Require a configured secret of at least `minLength` characters. */
export function requireConfiguredSecret(
  value: string | null | undefined,
  minLength = 16,
): string | null {
  const v = value?.trim();
  if (!v || v.length < minLength) return null;
  return v;
}
