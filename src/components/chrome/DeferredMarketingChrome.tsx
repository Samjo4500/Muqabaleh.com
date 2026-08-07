'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const MobileTabBar = dynamic(
  () => import('@/components/layout/MobileTabBar').then((m) => m.MobileTabBar),
  { ssr: false },
);
const PWAInstallPrompt = dynamic(
  () => import('@/components/pwa/InstallPrompt').then((m) => m.PWAInstallPrompt),
  { ssr: false },
);

function barePath(pathname: string): string {
  return pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
}

/**
 * Keep marketing pages lean — only hydrate app chrome on /app and similar.
 */
export function DeferredMarketingChrome() {
  const pathname = usePathname() || '/';
  const bare = barePath(pathname);
  const needsAppChrome =
    bare === '/app' ||
    bare.startsWith('/app/') ||
    bare.startsWith('/interviewer/') ||
    bare.startsWith('/b2b/') ||
    bare.startsWith('/partner/');

  if (!needsAppChrome) return null;

  return (
    <>
      <MobileTabBar />
      <PWAInstallPrompt />
    </>
  );
}
