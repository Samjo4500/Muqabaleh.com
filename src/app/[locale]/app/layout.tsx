import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { FullMessages } from '@/components/i18n/FullMessages';
import AppShell from './AppShell';

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <FullMessages>
      <AppShell>{children}</AppShell>
    </FullMessages>
  );
}
