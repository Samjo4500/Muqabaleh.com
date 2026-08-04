import { WifiOff } from 'lucide-react';

export function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-void)] p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
        <WifiOff size={36} className="text-[var(--text-muted)]" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">You are offline</h1>
      <p className="max-w-sm text-sm text-[var(--text-muted)]">
        Some features may be unavailable. Please check your internet connection.
      </p>
    </div>
  );
}
