import { FullMessages } from '@/components/i18n/FullMessages';
import { PartnerChrome } from './partner-chrome';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <FullMessages>
      <PartnerChrome>{children}</PartnerChrome>
    </FullMessages>
  );
}
