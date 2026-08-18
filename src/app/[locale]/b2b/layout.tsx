import { FullMessages } from '@/components/i18n/FullMessages';
import { B2BChrome } from './b2b-chrome';

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  return (
    <FullMessages>
      <B2BChrome>{children}</B2BChrome>
    </FullMessages>
  );
}
