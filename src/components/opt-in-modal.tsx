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
}

export function OptInModal({ open, onOpenChange, muqabalehScore, interviewId, onSave }: OptInModalProps) {
  const t = useTranslations('optIn');
  const [checked, setChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const isLowScore = muqabalehScore < 6;

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
          optIn: true,
          score: muqabalehScore,
          interviewId,
        }),
      });
      const data = await res.json();
      if (data.isVisible) {
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
                className="flex-1 border-white/10 text-[var(--text-muted)] hover:text-white"
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
