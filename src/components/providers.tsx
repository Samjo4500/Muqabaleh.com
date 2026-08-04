'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { type ReactNode } from 'react';
import { PWAInstallPrompt } from '@/components/pwa/InstallPrompt';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
        {children}
        <PWAInstallPrompt />
      </ThemeProvider>
    </SessionProvider>
  );
}
