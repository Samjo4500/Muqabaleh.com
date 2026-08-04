'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ReviewDialogProps {
  bookingId: string;
  interviewerId: string;
  interviewerName: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function ReviewDialog({
  bookingId,
  interviewerId: _interviewerId,
  interviewerName,
  open,
  onClose,
  onSubmit,
}: ReviewDialogProps) {
  const t = useTranslations('app.bookings');
  const tc = useTranslations('common');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, rating, comment: comment.trim() || undefined }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.error?.en || t('reviewError'));
        return;
      }
      toast.success(t('reviewSuccess'));
      onSubmit();
      onClose();
      // Reset state for next use
      setRating(0);
      setComment('');
      setHoveredStar(0);
    } catch {
      toast.error(t('reviewError'));
    } finally {
      setSubmitting(false);
    }
  };

  const displayStars = hoveredStar || rating;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-[var(--bg-panel)] border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)]">
            {t('reviewTitle')}
          </DialogTitle>
          <DialogDescription className="text-[var(--text-muted)]">
            {t('reviewSubtitle', { name: interviewerName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Star rating */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="cursor-pointer p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  size={32}
                  strokeWidth={1.5}
                  className={
                    star <= displayStars
                      ? 'fill-gold text-gold'
                      : 'text-white/20'
                  }
                />
              </button>
            ))}
          </div>

          {/* Text review */}
          <div className="space-y-2">
            <Textarea
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setComment(e.target.value);
                }
              }}
              placeholder={t('reviewPlaceholder')}
              className="min-h-[100px] resize-none border-white/10 bg-white/5 text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus-visible:ring-gold/30"
            />
            <p className="text-right text-xs text-[var(--text-faint)]">
              {t('reviewCharLimit', { count: comment.length })}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            disabled={submitting}
          >
            {tc('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="btn-gold flex-1 cursor-pointer px-6"
          >
            {submitting && <Loader2 size={14} className="me-2 animate-spin" />}
            {t('reviewSubmit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
