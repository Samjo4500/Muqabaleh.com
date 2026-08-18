'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { pathNeedsSession } from '@/lib/perf/session-paths';

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const inner = (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );

  if (!pathNeedsSession(pathname)) return inner;

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {inner}
    </SessionProvider>
  );
}
