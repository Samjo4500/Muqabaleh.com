import { FullMessages } from '@/components/i18n/FullMessages';

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <FullMessages>{children}</FullMessages>;
}
