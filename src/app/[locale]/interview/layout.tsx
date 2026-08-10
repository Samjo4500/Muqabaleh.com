import { headers } from 'next/headers';
import {
  PartnerBrandProvider,
  PartnerInterviewChrome,
} from '@/components/partner/PartnerBrandProvider';

/**
 * Candidate interview shell — applies white-label partner branding when
 * the request host resolves to a verified partner domain.
 */
export default async function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const hostHint = h.get('x-partner-host');

  return (
    <PartnerBrandProvider hostHint={hostHint}>
      <div className="interview-wl-shell">
        <div className="mq-wrap pt-3 empty:hidden [&:has(.wl-chrome)]:block">
          <PartnerInterviewChrome />
        </div>
        {children}
      </div>
    </PartnerBrandProvider>
  );
}
