'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { Plus, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowCard } from '@/components/brand';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SlotRow = { id: number; day: string; from: string; to: string; tz: string };

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

const timezones = ['Asia/Riyadh', 'Asia/Dubai', 'Asia/Qatar', 'Asia/Kuwait', 'Asia/Bahrain', 'Asia/Oman', 'Africa/Cairo', 'Europe/London'];

export default function AvailabilityPage() {
  const t = useTranslations('interviewerPanel');
  const locale = useLocale();
  const days = locale === 'ar' ? AR_DAYS : EN_DAYS;

  const [rows, setRows] = useState<SlotRow[]>([
    { id: 1, day: days[0], from: '09:00', to: '12:00', tz: 'Asia/Riyadh' },
    { id: 2, day: days[1], from: '14:00', to: '17:00', tz: 'Asia/Riyadh' },
    { id: 3, day: days[3], from: '10:00', to: '14:00', tz: 'Asia/Riyadh' },
    { id: 4, day: days[5], from: '16:00', to: '20:00', tz: 'Asia/Riyadh' },
  ]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), day: days[0], from: '09:00', to: '17:00', tz: 'Asia/Riyadh' },
    ]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, field: keyof SlotRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

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
          <div className="hidden items-center gap-4 md:grid md:grid-cols-[1fr_1fr_1fr_1fr_40px]">
            <span className="text-sm font-medium text-[var(--text-muted)]"></span>
            <span className="text-sm font-medium text-[var(--text-muted)]">{t('from')}</span>
            <span className="text-sm font-medium text-[var(--text-muted)]">{t('to')}</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)]">
              <Clock size={14} strokeWidth={1.75} />
              {t('timezone')}
            </span>
            <span></span>
          </div>

          {/* Rows */}
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-xl bg-white/[0.03] p-3 md:grid-cols-[1fr_1fr_1fr_1fr_40px] md:items-center"
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

              {/* Timezone */}
              <Select value={row.tz} onValueChange={(v) => updateRow(row.id, 'tz', v)}>
                <SelectTrigger className="glass-input border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[var(--bg-panel)]">
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
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
            className="w-full gap-2 text-[var(--text-muted)] hover:text-gold hover:bg-gold/5"
          >
            <Plus size={18} strokeWidth={1.75} />
            {t('addRow')}
          </Button>
        </div>
      </GlowCard>

      {/* Save button */}
      <div className="flex justify-end">
        <Button className="btn-gold min-w-[140px]">{t('save')}</Button>
      </div>
    </div>
  );
}
