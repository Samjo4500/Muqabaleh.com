'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CAREER_LEVELS,
  EMPLOYMENT_TYPES,
  MENA_COUNTRIES,
  VACANCY_INDUSTRIES,
} from '@/lib/constants';

export default function NewJobPage() {
  const t = useTranslations('b2b.jobs');
  const locale = useLocale();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState('IT');
  const [employmentType, setEmploymentType] = useState('fulltime');
  const [careerLevel, setCareerLevel] = useState('MID');
  const [department, setDepartment] = useState('engineering');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('SA');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [status, setStatus] = useState('OPEN');

  async function handleCreate() {
    if (title.trim().length < 2) {
      toast.error(locale === 'ar' ? 'أدخل عنوان الوظيفة' : 'Enter a job title');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/b2b/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          industry,
          type: 'behavioral',
          mode: 'AI',
          employmentType,
          careerLevel,
          department,
          country,
          city,
          location: location || city || country,
          salaryRange: salaryRange || null,
          description: description || null,
          requirements: requirements || null,
          tags: tags || null,
          isPublic,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed');
        return;
      }
      toast.success(locale === 'ar' ? 'تم إنشاء الوظيفة' : 'Job created');
      router.push(`/b2b/jobs/${data.job.id}`);
    } catch {
      toast.error(locale === 'ar' ? 'فشل الإنشاء' : 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/b2b/jobs"
          className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--aurora-2)]"
        >
          <ArrowRight size={20} strokeWidth={1.75} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('newTitle')}</h1>
      </div>

      <div className="glass-card space-y-6 rounded-2xl p-6">
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">{t('jobTitle')}</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('jobTitlePlaceholder')}
            className="glass-input"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">{t('industry')}</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VACANCY_INDUSTRIES.map((ind) => (
                  <SelectItem key={ind.code} value={ind.code}>
                    {locale === 'ar' ? ind.ar : ind.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">
              {locale === 'ar' ? 'نوع الدوام' : 'Employment type'}
            </Label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((opt) => (
                  <SelectItem key={opt.code} value={opt.code}>
                    {locale === 'ar' ? opt.ar : opt.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">
            {locale === 'ar' ? 'المستوى' : 'Career level'}
          </Label>
          <Select value={careerLevel} onValueChange={setCareerLevel}>
            <SelectTrigger className="glass-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAREER_LEVELS.map((opt) => (
                <SelectItem key={opt.code} value={opt.code}>
                  {locale === 'ar' ? opt.ar : opt.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">
              {locale === 'ar' ? 'القسم' : 'Department'}
            </Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['engineering', 'product', 'design', 'people', 'data', 'sales'].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">
              {locale === 'ar' ? 'الدولة' : 'Country'}
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MENA_COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {locale === 'ar'
                      ? `${c.flag_emoji} ${c.name_ar}`
                      : `${c.flag_emoji} ${c.name_en}`}
                  </SelectItem>
                ))}
                <SelectItem value="REMOTE">
                  {locale === 'ar' ? 'عن بُعد · المنطقة' : 'Remote · MENA'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">
              {locale === 'ar' ? 'المدينة' : 'City'}
            </Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="glass-input"
              placeholder={locale === 'ar' ? 'الرياض' : 'Riyadh'}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">
              {locale === 'ar' ? 'الموقع الظاهر' : 'Display location'}
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="glass-input"
              placeholder={locale === 'ar' ? 'الرياض · هجين' : 'Riyadh · Hybrid'}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">
              {locale === 'ar' ? 'نطاق الراتب' : 'Salary range'}
            </Label>
            <Input
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="glass-input"
              placeholder="AED 15–25k"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">
            {locale === 'ar' ? 'الوصف' : 'Description'}
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="glass-input min-h-[120px]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">
            {locale === 'ar' ? 'المتطلبات' : 'Requirements'}
          </Label>
          <Textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="glass-input min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">
            {locale === 'ar' ? 'وسوم (مفصولة بفواصل)' : 'Tags (comma-separated)'}
          </Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} className="glass-input" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="accent-teal-400"
            />
            {locale === 'ar' ? 'نشر في الشواغر المتاحة' : 'Publish on Available Vacancies'}
          </label>
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">{t('status')}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">OPEN</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="PAUSED">PAUSED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleCreate}
          disabled={saving}
          className="glass-button w-full cursor-pointer sm:w-auto"
        >
          {saving ? <Loader2 className="me-2 animate-spin" size={16} /> : null}
          {t('createJob')}
        </Button>
      </div>
    </div>
  );
}
