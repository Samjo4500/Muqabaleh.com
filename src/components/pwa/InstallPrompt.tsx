'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/useServiceWorker';

const VISIT_KEY = 'pwa_visit_count';
const DISMISS_KEY = 'pwa_dismissed_at';
const DISMISS_DAYS = 7;

export function PWAInstallPrompt() {
  const t = useTranslations('pwa');
  const { isInstallable, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // Increment visit count as a side effect
  useEffect(() => {
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10);
    localStorage.setItem(VISIT_KEY, String(visits + 1));
  }, []);

  // Derive visibility from conditions (no synchronous setState in effect)
  const shouldShow = useMemo(() => {
    if (dismissed) return false;
    if (typeof window === 'undefined') return false;

    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10);
    if (visits < 2) return false;

    const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
    const daysSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceDismiss < DISMISS_DAYS) return false;

    if (window.innerWidth >= 768) return false;

    return true;
  }, [dismissed]);

  const handleInstall = async () => {
    await promptInstall();
    setDismissed(true);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  if (!shouldShow || !isInstallable) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] md:hidden">
      <div className="border-t border-[var(--gold)]/30 bg-[var(--bg-panel)]/95 px-4 py-3 backdrop-blur-lg">
        <button
          onClick={handleDismiss}
          className="absolute end-3 top-3 cursor-pointer rounded-full p-1 text-[var(--text-faint)] transition-colors hover:text-[var(--text-primary)]"
          aria-label={t('dismissButton')}
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10">
            <Download size={20} className="text-[var(--gold)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {t('installTitle')}
            </p>
            <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
              {t('installDescription')}
            </p>
          </div>
          <button
            onClick={handleInstall}
            className="shrink-0 cursor-pointer rounded-lg bg-[var(--gold)] px-4 py-2 text-sm font-bold text-void transition-opacity hover:opacity-90"
          >
            {t('installButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
