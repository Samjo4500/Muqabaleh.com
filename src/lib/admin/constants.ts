/**
 * Designated Super Admin / Founder emails that always receive Super Admin rights.
 */
export const SUPER_ADMIN_EMAILS = [
  'sam@muqabaleh.com',
  'samjo4500@gmail.com',
] as const;

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  const configured = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (configured && lower === configured) return true;
  return SUPER_ADMIN_EMAILS.some((admin) => admin.toLowerCase() === lower);
}
