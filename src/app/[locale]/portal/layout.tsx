import { FullMessages } from '@/components/i18n/FullMessages';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <FullMessages>{children}</FullMessages>;
}
