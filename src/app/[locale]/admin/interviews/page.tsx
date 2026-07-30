'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlowCard } from '@/components/brand';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

type InterviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EVALUATION_FAILED';
type Mode = 'AI' | 'HUMAN';

type MockInterview = {
  id: string;
  user: string;
  mode: Mode;
  industry: string;
  type: string;
  status: InterviewStatus;
  score: string;
  date: string;
};

const mockInterviews: MockInterview[] = [
  { id: 'INT-8f3a2b1c4', user: 'سارة المحمدي', mode: 'AI', industry: 'تقنية المعلومات', type: 'TECHNICAL', status: 'COMPLETED', score: '92', date: '2025-07-28' },
  { id: 'INT-7b1c4d5e8', user: 'أحمد العتيبي', mode: 'HUMAN', industry: 'الموارد البشرية', type: 'BEHAVIORAL', status: 'COMPLETED', score: '88', date: '2025-07-27' },
  { id: 'INT-6d2e8f0a3', user: 'نورة القحطاني', mode: 'AI', industry: 'التسويق', type: 'BEHAVIORAL', status: 'IN_PROGRESS', score: '—', date: '2025-07-27' },
  { id: 'INT-5a9f1b2c6', user: 'فهد العنزي', mode: 'AI', industry: 'الهندسة', type: 'TECHNICAL', status: 'PENDING', score: '—', date: '2025-07-26' },
  { id: 'INT-4c8d3e7f0', user: 'خالد الشمري', mode: 'HUMAN', industry: 'المالية', type: 'BEHAVIORAL', status: 'COMPLETED', score: '75', date: '2025-07-25' },
  { id: 'INT-3e7b5a1d9', user: 'ليلى الدوسري', mode: 'AI', industry: 'تقنية المعلومات', type: 'TECHNICAL', status: 'EVALUATION_FAILED', score: '—', date: '2025-07-25' },
  { id: 'INT-2f6a9c4b8', user: 'سلطان الحربي', mode: 'AI', industry: 'التعليم', type: 'BEHAVIORAL', status: 'COMPLETED', score: '81', date: '2025-07-24' },
  { id: 'INT-1d5c7e2a6', user: 'هند السالم', mode: 'HUMAN', industry: 'الصحة', type: 'BEHAVIORAL', status: 'EVALUATION_FAILED', score: '—', date: '2025-07-23' },
];

const STATUS_COLORS: Record<InterviewStatus, string> = {
  PENDING: 'bg-[var(--status-amber)]/10 text-[var(--status-amber)] border-[var(--status-amber)]/30',
  IN_PROGRESS: 'bg-cyan/10 text-cyan border-cyan/30',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  EVALUATION_FAILED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const STATUS_KEYS: Record<InterviewStatus, string> = {
  PENDING: 'statusPending',
  IN_PROGRESS: 'statusInProgress',
  COMPLETED: 'statusCompleted',
  EVALUATION_FAILED: 'statusEvalFailed',
};

export default function InterviewsPage() {
  const t = useTranslations('adminPanel.interviews');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = mockInterviews.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          {t('title')}
        </h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full glass-input sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('statusAll')}</SelectItem>
            <SelectItem value="PENDING">{t('statusPending')}</SelectItem>
            <SelectItem value="IN_PROGRESS">{t('statusInProgress')}</SelectItem>
            <SelectItem value="COMPLETED">{t('statusCompleted')}</SelectItem>
            <SelectItem value="EVALUATION_FAILED">{t('statusEvalFailed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <GlowCard className="overflow-hidden !p-0">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[var(--text-muted)]">{t('colId')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colUser')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colMode')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colIndustry')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colType')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colScore')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colDate')}</TableHead>
                <TableHead className="text-[var(--text-muted)]"/>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, idx) => (
                <TableRow key={idx} className="border-white/[0.06] hover:bg-white/[0.02]">
                  <TableCell className="text-[var(--text-faint)] font-mono text-xs">{item.id.slice(0, 12)}...</TableCell>
                  <TableCell className="font-medium text-[var(--text-primary)]">{item.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.mode === 'AI' ? 'bg-gold/10 text-gold border-gold/30' : 'bg-cyan/10 text-cyan border-cyan/30'}>
                      {item.mode === 'AI' ? t('modeAI') : t('modeHuman')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--text-muted)]">{item.industry}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white/[0.04] text-[var(--text-muted)] border-white/10">
                      {item.type === 'BEHAVIORAL' ? t('typeBehavioral') : t('typeTechnical')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[item.status]}>
                      {t(STATUS_KEYS[item.status])}
                    </Badge>
                  </TableCell>
                  <TableCell className={item.score === '—' ? 'text-[var(--text-faint)]' : 'text-gold font-mono font-bold'}>{item.score}</TableCell>
                  <TableCell className="text-[var(--text-muted)] font-mono">{item.date}</TableCell>
                  <TableCell>
                    {item.status === 'EVALUATION_FAILED' && (
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                      >
                        <RefreshCw size={14} strokeWidth={1.75} />
                        {t('regenerateEval')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlowCard>
    </div>
  );
}
