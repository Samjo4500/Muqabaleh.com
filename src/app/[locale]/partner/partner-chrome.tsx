'use client';

import { PartnerShell } from '@/components/partner/partner-shell';

export function PartnerChrome({ children }: { children: React.ReactNode }) {
  return <PartnerShell>{children}</PartnerShell>;
}
