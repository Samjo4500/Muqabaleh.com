'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface OptInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  muqabalehScore: number;
  interviewId: string;
  onSave: (data: { optIn: boolean }) => void;
  /** Optional role/level from interview context */
  role?: string;
  level?: string;
}

export function OptInModal({
  open,
  onOpenChange,
  muqabalehScore,
  interviewId,
  onSave,
  role,
  level,
}: OptInModalProps) {
  const t = useTranslations('optIn');
  const [checked, setChecked] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  // Score may be 0–10 (legacy UI) or 0–100 (coach). Treat < 1.5×10 as 0–10 scale.
  const normalized = muqabalehScore <= 10 ? muqabalehScore * 10 : muqabalehScore;
  const isLowScore = normalized < 60;

  const handleSave = async () => {
    if (!checked) {
      onOpenChange(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/candidate-pool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOptedIn: true,
          optIn: true,
          interviewId,
          role: role || 'Professional',
          level: level || 'MID',
          marketingOptIn: marketing,
        }),
      });
      const data = await res.json();
      if (data.isVisible || data.success) {
        setSaved(true);
      }
      onSave({ optIn: true });
    } catch {
      onSave({ optIn: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#0B0F17] text-white sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[var(--gold)]">
            {t('title')}
          </DialogTitle>
        </DialogHeader>
        {saved ? (
          <div className="py-6 text-center">
            <p className="text-emerald-400 font-medium">{t('savedMsg')}</p>
            <Button
              onClick={() => onOpenChange(false)}
              className="mt-4 w-full bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
            >
              OK
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-xl font-bold">{t('headline')}</p>
            <p className="text-sm text-[var(--text-muted)]">{t('body')}</p>
            {isLowScore && (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
                {t('lowScoreMsg')}
              </p>
            )}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/30 accent-[var(--gold)]"
              />
              <span className="text-sm text-[var(--text-primary)]">{t('checkbox')}</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/30 accent-[var(--gold)]"
              />
              <span className="text-sm text-[var(--text-primary)]">
                {t('marketingCheckbox')}
              </span>
            </label>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={loading || !checked}
                className="flex-1 bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 disabled:opacity-40"
              >
                {loading ? '...' : t('save')}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-white/20 text-white/70"
              >
                {t('later')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
