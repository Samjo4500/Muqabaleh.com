'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GlowCard } from '@/components/brand';
import { toast } from 'sonner';

const sectorKeys = [
  'sectorTech',
  'sectorFinance',
  'sectorHealthcare',
  'sectorEducation',
  'sectorEngineering',
  'sectorMarketing',
  'sectorHR',
  'sectorConsulting',
  'sectorGovernment',
] as const;

const langKeys = [
  'langArabic',
  'langEnglish',
  'langFrench',
  'langUrdu',
  'langMalay',
  'langTurkish',
] as const;

export default function InterviewerProfilePage() {
  const t = useTranslations('interviewerPanel');

  const [bioAr, setBioAr] = useState('محاور معتمد بخبرة تزيد عن 10 سنوات');
  const [bioEn, setBioEn] = useState('Accredited interviewer with 10+ years of experience');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['sectorTech', 'sectorFinance', 'sectorHR']);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['langArabic', 'langEnglish']);
  const [years, setYears] = useState('12');
  const [currentTitle, setCurrentTitle] = useState('Senior Recruiter');
  const [price, setPrice] = useState('65');
  const [exclusionSectors, setExclusionSectors] = useState<string[]>(['sectorGovernment']);

  const toggleSector = (key: string) => {
    setSelectedSectors((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const toggleLang = (key: string) => {
    setSelectedLangs((prev) =>
      prev.includes(key) ? prev.filter((l) => l !== key) : [...prev, key]
    );
  };

  const toggleExclusion = (key: string) => {
    setExclusionSectors((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('profileTitle')}
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <GlowCard>
            <h2 className="mb-4 text-base font-bold text-[var(--text-primary)]">
              {t('photoUpload')}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold/20">
                <User size={32} strokeWidth={1.75} className="text-gold" />
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-sm text-[var(--text-muted)] transition-colors hover:border-gold/40 hover:text-gold"
                >
                  <Upload size={20} strokeWidth={1.75} />
                  {t('photoUploadHint')}
                </button>
              </div>
            </div>
          </GlowCard>

          <GlowCard>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[var(--text-primary)]">
                {t('bioAr')}
              </Label>
              <Textarea
                value={bioAr}
                onChange={(e) => setBioAr(e.target.value)}
                placeholder={t('bioArPlaceholder')}
                className="glass-input min-h-[120px] border-white/10"
              />
            </div>
          </GlowCard>

          <GlowCard>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[var(--text-primary)]">
                {t('bioEn')}
              </Label>
              <Textarea
                value={bioEn}
                onChange={(e) => setBioEn(e.target.value)}
                placeholder={t('bioEnPlaceholder')}
                className="glass-input min-h-[120px] border-white/10"
              />
            </div>
          </GlowCard>

          <GlowCard>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[var(--text-primary)]">
                  {t('currentTitle')}
                </Label>
                <Input
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder={t('currentTitlePlaceholder')}
                  className="glass-input border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[var(--text-primary)]">
                    {t('yearsExperience')}
                  </Label>
                  <Input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="glass-input border-white/10"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[var(--text-primary)]">
                    {t('sessionPrice')}
                  </Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="glass-input border-white/10"
                    min={0}
                  />
                </div>
              </div>
            </div>
          </GlowCard>
        </div>

        <div className="space-y-6">
          <GlowCard>
            <h2 className="mb-4 text-base font-bold text-[var(--text-primary)]">
              {t('sectors')}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {sectorKeys.map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2.5 cursor-pointer transition-colors hover:bg-white/5 has-[[data-state=checked]]:border-gold/30 has-[[data-state=checked]]:bg-gold/5"
                >
                  <Checkbox
                    checked={selectedSectors.includes(key)}
                    onCheckedChange={() => toggleSector(key)}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{t(key)}</span>
                </label>
              ))}
            </div>
          </GlowCard>

          <GlowCard>
            <h2 className="mb-4 text-base font-bold text-[var(--text-primary)]">
              {t('languages')}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {langKeys.map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2.5 cursor-pointer transition-colors hover:bg-white/5 has-[[data-state=checked]]:border-gold/30 has-[[data-state=checked]]:bg-gold/5"
                >
                  <Checkbox
                    checked={selectedLangs.includes(key)}
                    onCheckedChange={() => toggleLang(key)}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{t(key)}</span>
                </label>
              ))}
            </div>
          </GlowCard>

          <GlowCard>
            <h2 className="mb-1 text-base font-bold text-[var(--text-primary)]">
              {t('exclusionTitle')}
            </h2>
            <p className="mb-4 text-sm text-[var(--text-muted)]">{t('exclusionHint')}</p>
            <div className="grid grid-cols-2 gap-3">
              {sectorKeys.map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2.5 cursor-pointer transition-colors hover:bg-white/5 has-[[data-state=checked]]:border-red-500/30 has-[[data-state=checked]]:bg-red-500/5"
                >
                  <Checkbox
                    checked={exclusionSectors.includes(key)}
                    onCheckedChange={() => toggleExclusion(key)}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{t(key)}</span>
                </label>
              ))}
            </div>
          </GlowCard>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          className="btn-gold min-w-[160px]"
          onClick={() => toast.success(t('saveProfile'))}
        >
          {t('saveProfile')}
        </Button>
      </div>
    </div>
  );
}
