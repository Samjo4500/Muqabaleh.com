'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlowCard } from '@/components/brand';

const JOB_STATUSES = ['available', 'open', 'notLooking'] as const;

export default function SettingsPage() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // State
  const [isOptedIn, setIsOptedIn] = useState(true);
  const [jobStatus, setJobStatus] = useState<string>('open');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);

  // Demo data
  const demoScore = 7;
  const demoLevel = isRTL ? 'متقدم' : 'Advanced';
  const demoInterviewCount = 3;

  const handleSave = async () => {
    setSaving(true);
    try {
      // POST to candidate pool API
      const res = await fetch('/api/candidate-pool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          role: 'Software Engineer',
          level: 'Mid',
          industry,
          location,
          muqabalehScore: demoScore,
          interviewCount: demoInterviewCount,
          languages: locale === 'ar' ? 'AR' : 'EN',
          isOptedIn,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(t('saved'));
      } else {
        toast.error(data.error || 'Error');
      }
    } catch {
      // Fallback for demo mode
      toast.success(t('saved'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('title')}
        </h1>
      </div>

      {/* ── Employer Database Section ── */}
      <GlowCard className="p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {t('databaseSection')}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {t('databaseDesc')}
        </p>

        {/* Toggle */}
        <div className="mt-6 flex items-center gap-3">
          <Switch
            id="opt-in"
            checked={isOptedIn}
            onCheckedChange={setIsOptedIn}
          />
          <Label htmlFor="opt-in" className="text-sm text-[var(--text-muted)]">
            {t('databaseToggle')}
          </Label>
        </div>

        {/* Job Status */}
        <div className="mt-6">
          <Label className="mb-2 text-sm font-medium text-[var(--text-muted)]">
            {t('jobStatus')}
          </Label>
          <Select value={jobStatus} onValueChange={setJobStatus}>
            <SelectTrigger className="w-full border-white/10 bg-white/5 text-[var(--text-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`jobStatus${status.charAt(0).toUpperCase()}${status.slice(1)}` as Parameters<typeof t>[0])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="mt-6">
          <Label className="mb-2 text-sm font-medium text-[var(--text-muted)]">
            {t('location')}
          </Label>
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('locationPlaceholder')}
            className="border-white/10 bg-white/5 text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
          />
        </div>

        {/* Industry */}
        <div className="mt-6">
          <Label className="mb-2 text-sm font-medium text-[var(--text-muted)]">
            {t('industry')}
          </Label>
          <Input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder={t('industryPlaceholder')}
            className="border-white/10 bg-white/5 text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
          />
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-gold min-w-[140px]"
          >
            {saving ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : t('save')}
          </Button>
        </div>
      </GlowCard>

      {/* ── Score Info Section (Read-only) ── */}
      <GlowCard className="p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {isRTL ? 'معلومات النتيجة' : 'Score Information'}
        </h2>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/5 px-4 py-3">
            <span className="text-sm text-[var(--text-muted)]">
              {t('scoreInfo', { score: demoScore, level: demoLevel })}
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/5 px-4 py-3">
            <span className="text-sm text-[var(--text-muted)]">
              {t('interviewCount', { count: demoInterviewCount })}
            </span>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
