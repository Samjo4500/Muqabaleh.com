'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { Upload, User, Loader2 } from 'lucide-react';
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

const LANG_MAP: Record<string, string> = {
  AR: 'langArabic',
  EN: 'langEnglish',
  FR: 'langFrench',
  UR: 'langUrdu',
  MS: 'langMalay',
  TR: 'langTurkish',
};

const REVERSE_LANG_MAP: Record<string, string> = {
  langArabic: 'AR',
  langEnglish: 'EN',
  langFrench: 'FR',
  langUrdu: 'UR',
  langMalay: 'MS',
  langTurkish: 'TR',
};

export default function InterviewerProfilePage() {
  const t = useTranslations('interviewerPanel');
  const tc = useTranslations('common');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bioAr, setBioAr] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [exclusionSectors, setExclusionSectors] = useState<string[]>([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [price, setPrice] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/interviewer/me');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.error?.en || tc('error'));
        return;
      }
      const data = await res.json();
      const i = data.interviewer;

      setBioAr(i.bioAr || '');
      setBioEn(i.bio || '');
      setCurrentTitle(i.currentTitle || '');
      setPrice(String(i.hourlyRate / 100));

      const specialties: string[] = i.specialties || [];
      setSelectedSectors(specialties);

      const languages: string[] = i.languages || ['AR'];
      const langKeysFromApi = languages
        .map((code) => LANG_MAP[code])
        .filter(Boolean);
      setSelectedLangs(langKeysFromApi);
    } catch {
      toast.error(tc('error'));
    } finally {
      setLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const langs = selectedLangs
        .map((k) => REVERSE_LANG_MAP[k])
        .filter(Boolean);

      const payload: Record<string, unknown> = {
        bio: bioEn,
        bioAr,
        specialties: selectedSectors,
        languages: langs,
        hourlyRate: Math.round(parseFloat(price) * 100) || 0,
      };

      const res = await fetch('/api/interviewer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.error?.en || tc('error'));
        return;
      }

      toast.success(t('saveProfile'));
    } catch {
      toast.error(tc('error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <Loader2 size={16} className="me-2 animate-spin" />}
          {t('saveProfile')}
        </Button>
      </div>
    </div>
  );
}
