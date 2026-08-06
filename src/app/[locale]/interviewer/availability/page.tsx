'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowCard } from '@/components/brand';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type SlotRow = { id: number; day: string; from: string; to: string };

type ApiSlot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

const AR_DAYS = ['daySat', 'daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri'];
const EN_DAYS = ['dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat', 'daySun'];

function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let h = 6; h <= 22; h++) {
    const hour = h.toString().padStart(2, '0');
    times.push(`${hour}:00`);
    if (h < 22) times.push(`${hour}:30`);
  }
  return times;
}

const timeOptions = generateTimeOptions();

function dayToApiDayOfWeek(dayKey: string, locale: string): number {
  const days = locale === 'ar' ? AR_DAYS : EN_DAYS;
  return days.indexOf(dayKey);
}

export default function AvailabilityPage() {
  const t = useTranslations('interviewerPanel');
  const tc = useTranslations('common');
  const locale = useLocale();
  const days = locale === 'ar' ? AR_DAYS : EN_DAYS;

  const [rows, setRows] = useState<SlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch('/api/interviewer/availability');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.error?.en || tc('error'));
        return;
      }
      const data = await res.json();
      const apiSlots: ApiSlot[] = data.slots || [];
      if (apiSlots.length > 0) {
        const mapped: SlotRow[] = apiSlots.map((s) => ({
          id: Date.now() + Math.random(),
          day: days[s.dayOfWeek] || days[0],
          from: s.startTime,
          to: s.endTime,
        }));
        setRows(mapped);
      } else {
        setRows([
          { id: 1, day: days[0], from: '09:00', to: '12:00' },
        ]);
      }
    } catch {
      toast.error(tc('error'));
    } finally {
      setLoading(false);
    }
  }, [days, tc]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), day: days[0], from: '09:00', to: '17:00' },
    ]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, field: keyof SlotRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slots = rows.map((r) => ({
        dayOfWeek: dayToApiDayOfWeek(r.day, locale),
        startTime: r.from,
        endTime: r.to,
        isAvailable: true,
      }));

      const res = await fetch('/api/interviewer/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.error?.en || tc('error'));
        return;
      }

      toast.success(t('save'));
    } catch {
      toast.error(tc('error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-white/10" />
        <div className="h-4 w-80 animate-pulse rounded-lg bg-white/10" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.04] border border-white/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('availTitle')}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t('availSub')}</p>
      </div>

      <GlowCard>
        <div className="space-y-4">
          {/* Header row */}
          <div className="hidden items-center gap-4 md:grid md:grid-cols-[1fr_1fr_1fr_40px]">
            <span className="text-sm font-medium text-[var(--text-muted)]"></span>
            <span className="text-sm font-medium text-[var(--text-muted)]">{t('from')}</span>
            <span className="text-sm font-medium text-[var(--text-muted)]">{t('to')}</span>
            <span></span>
          </div>

          {/* Rows */}
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-xl bg-white/[0.03] p-3 md:grid-cols-[1fr_1fr_1fr_40px] md:items-center"
            >
              {/* Day select */}
              <Select value={row.day} onValueChange={(v) => updateRow(row.id, 'day', v)}>
                <SelectTrigger className="glass-input border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[var(--bg-panel)]">
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>
                      {t(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* From */}
              <Select value={row.from} onValueChange={(v) => updateRow(row.id, 'from', v)}>
                <SelectTrigger className="glass-input border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[var(--bg-panel)] max-h-60">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* To */}
              <Select value={row.to} onValueChange={(v) => updateRow(row.id, 'to', v)}>
                <SelectTrigger className="glass-input border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[var(--bg-panel)] max-h-60">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label={t('removeRow')}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
          ))}

          {/* Add row button */}
          <Button
            variant="ghost"
            onClick={addRow}
            className="w-full gap-2 text-[var(--text-muted)] hover:text-teal-300 hover:bg-teal-400/5"
          >
            <Plus size={18} strokeWidth={1.75} />
            {t('addRow')}
          </Button>
        </div>
      </GlowCard>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          className="mq-btn mq-btn-primary min-w-[140px]"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : null}
          {t('save')}
        </Button>
      </div>
    </div>
  );
}
