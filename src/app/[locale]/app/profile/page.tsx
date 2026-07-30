'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { User, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlowCard } from '@/components/brand';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const countries = ['SA', 'AE', 'QA', 'BH', 'KW', 'OM', 'JO', 'EG', 'OTHER'];
const industries = ['IT', 'Finance', 'Medicine', 'Engineering', 'Education', 'Marketing', 'Sales', 'HR'];
const experiences = ['junior', 'mid', 'senior', 'executive'];
const genders = ['any', 'male', 'female'];

const countryLabels: Record<string, string> = {
  SA: '\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629',
  AE: '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629',
  QA: '\u0642\u0637\u0631',
  BH: '\u0627\u0644\u0628\u062d\u0631\u064a\u0646',
  KW: '\u0627\u0644\u0643\u0648\u064a\u062a',
  OM: '\u0639\u0645\u0627\u0646',
  JO: '\u0627\u0644\u0623\u0631\u062f\u0646',
  EG: '\u0645\u0635\u0631',
  OTHER: '\u0623\u062e\u0631\u0649',
};

export default function ProfilePage() {
  const t = useTranslations('app.profile');
  const tDash = useTranslations('app.dashboard');
  const tCommon = useTranslations('common');

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('');
  const [gender, setGender] = useState('');
  const [language, setLanguage] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const handleSave = () => {
    toast.success(t('saved'));
  };

  const handlePassword = () => {
    toast.info(tCommon('comingSoon'));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      {/* Profile form */}
      <GlowCard className="space-y-5 p-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
            <User size={20} strokeWidth={1.75} className="text-gold" />
          </div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">{t('title')}</h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('name')}</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className="glass-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('country')}</label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="glass-input w-full">
              <SelectValue placeholder={t('countryPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              {countries.map((c) => (
                <SelectItem key={c} value={c} className="text-[var(--text-primary)] focus:bg-white/5">
                  {countryLabels[c] ?? c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('industry')}</label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="glass-input w-full">
              <SelectValue placeholder={t('industryPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              {industries.map((ind) => {
                const key = `field${ind.charAt(0).toUpperCase() + ind.slice(1)}` as string;
                return (
                  <SelectItem key={ind} value={ind} className="text-[var(--text-primary)] focus:bg-white/5">
                    {tDash(key)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('experience')}</label>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger className="glass-input w-full">
              <SelectValue placeholder={t('expPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              {experiences.map((exp) => {
                const key = `exp${exp.charAt(0).toUpperCase() + exp.slice(1)}` as string;
                return (
                  <SelectItem key={exp} value={exp} className="text-[var(--text-primary)] focus:bg-white/5">
                    {tDash(key)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('preferredGender')}</label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="glass-input w-full">
              <SelectValue placeholder={t('genderPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              {genders.map((g) => {
                const key = `gender${g.charAt(0).toUpperCase() + g.slice(1)}` as string;
                return (
                  <SelectItem key={g} value={g} className="text-[var(--text-primary)] focus:bg-white/5">
                    {t(key)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('language')}</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="glass-input w-full">
              <SelectValue placeholder={t('langPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              <SelectItem value="ar" className="text-[var(--text-primary)] focus:bg-white/5">{'\u0627\u0644\u0639\u0631\u0628\u064a\u0629'}</SelectItem>
              <SelectItem value="en" className="text-[var(--text-primary)] focus:bg-white/5">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} className="btn-gold cursor-pointer">
          {t('save')}
        </Button>
      </GlowCard>

      {/* Change password */}
      <GlowCard className="space-y-5 p-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
            <Lock size={20} strokeWidth={1.75} className="text-gold" />
          </div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">{t('changePassword')}</h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('currentPassword')}</label>
          <Input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            className="glass-input"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('newPassword')}</label>
          <Input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="glass-input"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('confirmPassword')}</label>
          <Input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className="glass-input"
          />
        </div>
        <Button onClick={handlePassword} variant="outline" className="border-white/10 text-[var(--text-primary)] hover:border-gold/30 hover:text-gold cursor-pointer">
          {t('changePassword')}
        </Button>
      </GlowCard>

      {/* Danger zone */}
      <GlowCard className="space-y-4 p-6 border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
            <AlertTriangle size={20} strokeWidth={1.75} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-400">{t('dangerZone')}</h2>
            <p className="mt-1 text-xs text-[var(--text-faint)]">{t('deleteWarning')}</p>
          </div>
        </div>
        <AlertDialog open={step >= 1} onOpenChange={(open) => { if (!open) setStep(0); }}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer">
              {t('deleteAccount')}
            </Button>
          </AlertDialogTrigger>
          {step === 1 ? (
            <AlertDialogContent className="bg-[var(--bg-panel)] border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[var(--text-primary)]">{t('deleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription className="text-[var(--text-muted)]">{t('deleteWarning')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                  {tCommon('cancel')}
                </AlertDialogCancel>
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                >
                  {t('deleteConfirm1')}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          ) : (
            <AlertDialogContent className="bg-[var(--bg-panel)] border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[var(--text-primary)]">{t('deleteConfirm2')}</AlertDialogTitle>
                <AlertDialogDescription className="text-[var(--text-muted)]">{t('deleteWarning')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                  {tCommon('cancel')}
                </AlertDialogCancel>
                <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600 cursor-pointer">
                  {t('deleteAccount')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </GlowCard>
    </div>
  );
}
