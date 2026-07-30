'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
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
import { GlowCard } from '@/components/brand';
import { toast } from 'sonner';

const INDUSTRIES = ['sectorTech', 'sectorFinance', 'sectorHealthcare', 'sectorEducation', 'sectorEngineering', 'sectorMarketing', 'sectorHr', 'sectorOther'] as const;
const COUNTRIES = ['countrySaudi', 'countryUAE', 'countryQatar', 'countryBahrain', 'countryKuwait', 'countryOman', 'countryJordan', 'countryEgypt', 'countryOther'] as const;
const SIZES = ['sizeSmall', 'sizeMedium', 'sizeLarge'] as const;

const PANEL_INTERVIEWERS = [
  { name: 'interviewer1Name', role: 'interviewer1Role' },
  { name: 'interviewer2Name', role: 'interviewer2Role' },
] as const;

export default function SettingsPage() {
  const t = useTranslations('b2b.settings');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  const [companyName, setCompanyName] = useState(t('interviewer1Name').includes('هدى') ? 'شركة نيوم التقنية' : 'NEOM Tech Company');
  const [industry, setIndustry] = useState('sectorTech');
  const [country, setCountry] = useState('countrySaudi');
  const [size, setSize] = useState('sizeLarge');
  const [slaHours, setSlaHours] = useState('72');
  const [slaText, setSlaText] = useState('');
  const [interviewers, setInterviewers] = useState([...PANEL_INTERVIEWERS]);

  const removeInterviewer = (i: number) => {
    setInterviewers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = () => {
    toast.success(tCommon('save'));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      {/* Company Info */}
      <GlowCard className="p-6 space-y-5">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('companyInfo')}</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">{t('companyName')}</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="glass-input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm text-[var(--text-muted)]">{t('industry')}</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{tAuth(ind)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-[var(--text-muted)]">{t('country')}</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{tAuth(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">{t('companySize')}</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s} value={s}>{tAuth(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlowCard>

      {/* Panel Interviewers */}
      <GlowCard className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('panelInterviewers')}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('panelDesc')}</p>
        </div>
        <div className="space-y-3">
          {interviewers.map((intv, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{t(intv.name)}</p>
                <p className="text-xs text-[var(--text-faint)]">{t(intv.role)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeInterviewer(i)}
                className="rounded-lg p-2 text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label={t('removeInterviewer')}
              >
                <Trash2 size={16} strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* SLA Settings */}
      <GlowCard className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('slaSettings')}</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">{t('slaHours')}</Label>
            <Input
              type="number"
              value={slaHours}
              onChange={(e) => setSlaHours(e.target.value)}
              placeholder={t('slaHoursPlaceholder')}
              className="glass-input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">{t('slaCustomText')}</Label>
            <Textarea
              value={slaText}
              onChange={(e) => setSlaText(e.target.value)}
              placeholder={t('slaCustomPlaceholder')}
              rows={3}
              className="glass-input min-h-[80px] resize-y"
            />
          </div>
        </div>
      </GlowCard>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="btn-gold cursor-pointer">
          {t('save')}
        </Button>
      </div>
    </div>
  );
}
