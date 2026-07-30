'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/brand';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type LogEvent =
  | 'eventUserRegistered'
  | 'eventInterviewCompleted'
  | 'eventPaymentCaptured'
  | 'eventInterviewerApplied'
  | 'eventInterviewerApproved'
  | 'eventInterviewerRejected'
  | 'eventSessionAdded'
  | 'eventQuestionAdded'
  | 'eventSettingsUpdated'
  | 'eventPasswordReset'
  | 'eventLoginFailed';

type MockLog = {
  timestamp: string;
  user: string;
  event: LogEvent;
  description: string;
};

const mockLogs: MockLog[] = [
  { timestamp: '2025-07-28 14:32:05', user: 'سارة المحمدي', event: 'eventUserRegistered', description: 'تسجيل حساب جديد' },
  { timestamp: '2025-07-28 14:15:22', user: 'أحمد العتيبي', event: 'eventInterviewCompleted', description: 'اكتملت مقابلة تقنية مع درجة 92' },
  { timestamp: '2025-07-28 13:48:10', user: 'شركة نيوم', event: 'eventPaymentCaptured', description: 'دفعة $149.00 — خطة احترافية' },
  { timestamp: '2025-07-28 12:30:00', user: 'د. هدى السالم', event: 'eventInterviewerApplied', description: 'طلب انضمام كمحاور بشري' },
  { timestamp: '2025-07-28 11:22:45', user: 'م. سلطان الحربي', event: 'eventInterviewerApproved', description: 'تم اعتماد المحاور بعد المراجعة' },
  { timestamp: '2025-07-28 10:05:18', user: 'أ. سعاد المالكي', event: 'eventInterviewerRejected', description: 'تم رفض الطلب — عدم استيفاء المعايير' },
  { timestamp: '2025-07-27 22:10:33', user: 'فهد العنزي', event: 'eventSessionAdded', description: 'تمت إضافة 10 جلسات بواسطة المدير' },
  { timestamp: '2025-07-27 20:45:00', user: 'م. عمر البلوي', event: 'eventQuestionAdded', description: 'تم إضافة سؤال جديد: مفهوم microservices' },
  { timestamp: '2025-07-27 18:30:12', user: 'سلطان الحربي', event: 'eventSettingsUpdated', description: 'تحديث عمولة المنصة من 30% إلى 35%' },
  { timestamp: '2025-07-27 15:20:44', user: 'نورة القحطاني', event: 'eventPasswordReset', description: 'طلب إعادة تعيين كلمة المرور' },
];

const EVENT_COLORS: Record<LogEvent, string> = {
  eventUserRegistered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  eventInterviewCompleted: 'bg-cyan/10 text-cyan border-cyan/30',
  eventPaymentCaptured: 'bg-gold/10 text-gold border-gold/30',
  eventInterviewerApplied: 'bg-[var(--status-amber)]/10 text-[var(--status-amber)] border-[var(--status-amber)]/30',
  eventInterviewerApproved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  eventInterviewerRejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  eventSessionAdded: 'bg-cyan/10 text-cyan border-cyan/30',
  eventQuestionAdded: 'bg-[var(--status-amber)]/10 text-[var(--status-amber)] border-[var(--status-amber)]/30',
  eventSettingsUpdated: 'bg-white/[0.04] text-[var(--text-muted)] border-white/10',
  eventPasswordReset: 'bg-[var(--status-amber)]/10 text-[var(--status-amber)] border-[var(--status-amber)]/30',
  eventLoginFailed: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function LogsPage() {
  const t = useTranslations('adminPanel.logs');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = mockLogs.filter((l) => {
    if (search && !l.user.includes(search)) return false;
    if (dateFrom && l.timestamp.slice(0, 10) < dateFrom) return false;
    if (dateTo && l.timestamp.slice(0, 10) > dateTo) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        {t('title')}
      </h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} strokeWidth={1.75} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="ps-10 glass-input"
          />
        </div>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="glass-input sm:w-[180px]"
          aria-label={t('dateFrom')}
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="glass-input sm:w-[180px]"
          aria-label={t('dateTo')}
        />
      </div>

      <GlowCard className="overflow-hidden !p-0">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[var(--text-muted)]">{t('colTimestamp')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colUser')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colEvent')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colDescription')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l, i) => (
                <TableRow key={i} className="border-white/[0.06] hover:bg-white/[0.02]">
                  <TableCell className="text-[var(--text-faint)] font-mono text-xs whitespace-nowrap">{l.timestamp}</TableCell>
                  <TableCell className="font-medium text-[var(--text-primary)]">{l.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={EVENT_COLORS[l.event]}>
                      {t(l.event)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--text-muted)] max-w-[300px] truncate">{l.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlowCard>
    </div>
  );
}
