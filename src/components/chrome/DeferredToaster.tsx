'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { pathNeedsSession } from '@/lib/perf/session-paths';

const Toaster = dynamic(() => import('sonner').then((m) => m.Toaster), { ssr: false });

function needsToaster(pathname: string): boolean {
  if (pathNeedsSession(pathname)) return true;
  const bare = pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
  return bare === '/login' || bare.startsWith('/login/');
}

/** Sonner is idle on marketing home — keep it off the mobile TBT graph. */
export function DeferredToaster({ position }: { position: 'top-left' | 'top-right' }) {
  const pathname = usePathname() || '/';
  if (!needsToaster(pathname)) return null;
  return <Toaster position={position} richColors />;
}
