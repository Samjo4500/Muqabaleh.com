/** Super Admin inbox for /student100 submissions — separate from support tickets. */

export const STUDENT100_ALERT_KIND = 'student100' as const;
export const STUDENT100_ADMIN_PATH = '/admin/campaigns/student100';

export function student100InboxHref(claimId?: string): string {
  if (!claimId) return STUDENT100_ADMIN_PATH;
  return `${STUDENT100_ADMIN_PATH}?claim=${encodeURIComponent(claimId)}`;
}

export function student100AdminNotification(input: {
  id: string;
  name: string;
  email: string;
  university: string;
  country: string;
  status: 'PENDING' | 'ACTIVATED';
  proofNote?: string | null;
}) {
  const needsReview = input.status === 'PENDING';
  const proof = String(input.proofNote || '').trim();
  return {
    channel: 'IN_APP' as const,
    kind: STUDENT100_ALERT_KIND,
    severity: (needsReview ? 'warn' : 'info') as 'warn' | 'info',
    href: student100InboxHref(input.id),
    subject: needsReview
      ? `[Student 100] Review ${input.name}`
      : `[Student 100] Auto-activated ${input.name}`,
    body: [
      `${input.name} (${input.email})`,
      `${input.university} · ${input.country}`,
      needsReview ? 'Needs manual review' : 'Academic email — pack activated',
      proof ? `Proof: ${proof.slice(0, 140)}` : '',
    ]
      .filter(Boolean)
      .join(' — '),
    meta: {
      campaign: 'student100',
      claimId: input.id,
      status: input.status,
    },
  };
}
