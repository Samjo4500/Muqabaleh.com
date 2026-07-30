'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { GlowCard } from '@/components/brand';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type QType = 'BEHAVIORAL' | 'TECHNICAL' | 'SITUATIONAL';

type MockQuestion = {
  qArKey: string;
  qEnKey: string;
  industry: string;
  type: QType;
  difficulty: Difficulty;
  category: string;
  active: boolean;
};

const initialQuestions: MockQuestion[] = [
  { qArKey: 'q1Ar', qEnKey: 'q1En', industry: 'التقنية', type: 'BEHAVIORAL', difficulty: 'EASY', category: 'قيادة', active: true },
  { qArKey: 'q2Ar', qEnKey: 'q2En', industry: 'التقنية', type: 'TECHNICAL', difficulty: 'MEDIUM', category: 'مهارات تقنية', active: true },
  { qArKey: 'q3Ar', qEnKey: 'q3En', industry: 'الإدارة', type: 'BEHAVIORAL', difficulty: 'HARD', category: 'إدارة المشاريع', active: true },
  { qArKey: 'q4Ar', qEnKey: 'q4En', industry: 'الموارد البشرية', type: 'SITUATIONAL', difficulty: 'MEDIUM', category: 'العمل الجماعي', active: true },
  { qArKey: 'q5Ar', qEnKey: 'q5En', industry: 'التقنية', type: 'TECHNICAL', difficulty: 'HARD', category: 'هندسة البرمجيات', active: true },
  { qArKey: 'q6Ar', qEnKey: 'q6En', industry: 'الإدارة', type: 'BEHAVIORAL', difficulty: 'MEDIUM', category: 'إدارة الوقت', active: false },
  { qArKey: 'q7Ar', qEnKey: 'q7En', industry: 'التسويق', type: 'TECHNICAL', difficulty: 'EASY', category: 'تسويق رقمي', active: true },
  { qArKey: 'q8Ar', qEnKey: 'q8En', industry: 'التقنية', type: 'TECHNICAL', difficulty: 'MEDIUM', category: 'قواعد البيانات', active: true },
  { qArKey: 'q9Ar', qEnKey: 'q9En', industry: 'التقنية', type: 'BEHAVIORAL', difficulty: 'EASY', category: 'جودة الكود', active: true },
  { qArKey: 'q10Ar', qEnKey: 'q10En', industry: 'الإدارة', type: 'BEHAVIORAL', difficulty: 'HARD', category: 'بناء الفرق', active: false },
];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  EASY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-[var(--status-amber)]/10 text-[var(--status-amber)] border-[var(--status-amber)]/30',
  HARD: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const DIFFICULTY_KEYS: Record<Difficulty, string> = {
  EASY: 'difficultyEasy',
  MEDIUM: 'difficultyMedium',
  HARD: 'difficultyHard',
};

const TYPE_KEYS: Record<QType, string> = {
  BEHAVIORAL: 'typeBehavioral',
  TECHNICAL: 'typeTechnical',
  SITUATIONAL: 'typeSituational',
};

export default function QuestionsPage() {
  const t = useTranslations('adminPanel.questions');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [diffFilter, setDiffFilter] = useState('ALL');
  const [addOpen, setAddOpen] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions);
  const [form, setForm] = useState({ qAr: '', qEn: '', industry: '', type: '' as QType | '', difficulty: '' as Difficulty | '', category: '', active: true });

  const filtered = questions.filter((q) => {
    if (industryFilter !== 'ALL' && q.industry !== industryFilter) return false;
    if (typeFilter !== 'ALL' && q.type !== typeFilter) return false;
    if (diffFilter !== 'ALL' && q.difficulty !== diffFilter) return false;
    return true;
  });

  function toggleActive(idx: number) {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = filtered[idx];
      const realIdx = prev.indexOf(q);
      copy[realIdx] = { ...copy[realIdx], active: !copy[realIdx].active };
      return copy;
    });
  }

  function addQuestion() {
    if (!form.qAr || !form.qEn || !form.industry || !form.type || !form.difficulty) return;
    setQuestions((prev) => [
      {
        qArKey: 'custom',
        qEnKey: 'custom',
        industry: form.industry,
        type: form.type as QType,
        difficulty: form.difficulty as Difficulty,
        category: form.category,
        active: form.active,
        qAr: form.qAr,
        qEn: form.qEn,
      } as MockQuestion & { qAr: string; qEn: string },
      ...prev,
    ]);
    setAddOpen(false);
    setForm({ qAr: '', qEn: '', industry: '', type: '', difficulty: '', category: '', active: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          {t('title')}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-1.5 border-white/10 text-[var(--text-muted)] hover:bg-white/5"
          >
            <Upload size={16} strokeWidth={1.75} />
            {t('import')}
          </Button>
          <Button
            className="gap-1.5 bg-gold text-void hover:bg-gold-hover font-bold"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={16} strokeWidth={1.75} />
            {t('addQuestion')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-full glass-input sm:w-[180px]">
            <SelectValue placeholder={t('filterIndustry')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filterAll')}</SelectItem>
            <SelectItem value="التقنية">التقنية</SelectItem>
            <SelectItem value="الإدارة">الإدارة</SelectItem>
            <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
            <SelectItem value="التسويق">التسويق</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full glass-input sm:w-[180px]">
            <SelectValue placeholder={t('filterType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filterAll')}</SelectItem>
            <SelectItem value="BEHAVIORAL">{t('typeBehavioral')}</SelectItem>
            <SelectItem value="TECHNICAL">{t('typeTechnical')}</SelectItem>
            <SelectItem value="SITUATIONAL">{t('typeSituational')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={diffFilter} onValueChange={setDiffFilter}>
          <SelectTrigger className="w-full glass-input sm:w-[180px]">
            <SelectValue placeholder={t('filterDifficulty')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filterAll')}</SelectItem>
            <SelectItem value="EASY">{t('difficultyEasy')}</SelectItem>
            <SelectItem value="MEDIUM">{t('difficultyMedium')}</SelectItem>
            <SelectItem value="HARD">{t('difficultyHard')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <GlowCard className="overflow-hidden !p-0">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[var(--text-muted)]">{t('colQuestionAr')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colQuestionEn')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colIndustry')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colType')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colDifficulty')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colCategory')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colActive')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((q, i) => (
                <TableRow key={i} className="border-white/[0.06] hover:bg-white/[0.02]">
                  <TableCell className="max-w-[200px] truncate text-[var(--text-primary)]">
                    {(q as unknown as Record<string, string>).qAr || t(q.qArKey as `q${number}Ar`)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-[var(--text-muted)]">
                    {(q as unknown as Record<string, string>).qEn || t(q.qEnKey as `q${number}En`)}
                  </TableCell>
                  <TableCell className="text-[var(--text-muted)]">{q.industry}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white/[0.04] text-[var(--text-muted)] border-white/10">
                      {t(TYPE_KEYS[q.type])}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={DIFFICULTY_COLORS[q.difficulty]}>
                      {t(DIFFICULTY_KEYS[q.difficulty])}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--text-muted)]">{q.category}</TableCell>
                  <TableCell>
                    <Switch checked={q.active} onCheckedChange={() => toggleActive(i)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlowCard>

      {/* Add Question Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="glass-card !bg-[var(--bg-panel)] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">{t('addTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-[var(--text-muted)]">{t('questionAr')}</Label>
              <Textarea
                value={form.qAr}
                onChange={(e) => setForm({ ...form, qAr: e.target.value })}
                placeholder={t('questionArPlaceholder')}
                className="glass-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text-muted)]">{t('questionEn')}</Label>
              <Textarea
                value={form.qEn}
                onChange={(e) => setForm({ ...form, qEn: e.target.value })}
                placeholder={t('questionEnPlaceholder')}
                className="glass-input"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-[var(--text-muted)]">{t('industry')}</Label>
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder={t('industryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="التقنية">التقنية</SelectItem>
                    <SelectItem value="الإدارة">الإدارة</SelectItem>
                    <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
                    <SelectItem value="التسويق">التسويق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--text-muted)]">{t('type')}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as QType })}>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder={t('typePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEHAVIORAL">{t('typeBehavioral')}</SelectItem>
                    <SelectItem value="TECHNICAL">{t('typeTechnical')}</SelectItem>
                    <SelectItem value="SITUATIONAL">{t('typeSituational')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--text-muted)]">{t('difficulty')}</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as Difficulty })}>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder={t('difficultyPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">{t('difficultyEasy')}</SelectItem>
                    <SelectItem value="MEDIUM">{t('difficultyMedium')}</SelectItem>
                    <SelectItem value="HARD">{t('difficultyHard')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text-muted)]">{t('category')}</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder={t('categoryPlaceholder')}
                className="glass-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label className="text-[var(--text-muted)]">{t('active')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-gold text-void hover:bg-gold-hover font-bold"
              onClick={addQuestion}
            >
              {t('addQuestion')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
