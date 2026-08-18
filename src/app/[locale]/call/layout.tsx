import { FullMessages } from '@/components/i18n/FullMessages';

export default function CallLayout({ children }: { children: React.ReactNode }) {
  return <FullMessages>{children}</FullMessages>;
}
