'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { B2B_CONSOLE_PREVIEW } from '@/lib/b2b-preview';

const SIZES = ['SMALL', 'MEDIUM', 'LARGE'] as const;

export default function SettingsPage() {
  const t = useTranslations('b2b.settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [size, setSize] = useState('SMALL');
  const [slaHours, setSlaHours] = useState('72');
  const [plan, setPlan] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/b2b/company');
        const data = await res.json();
        if (cancelled || !res.ok || !data.company) return;
        setCompanyName(data.company.name || '');
        setIndustry(data.company.industry || '');
        setCountry(data.company.country || '');
        setSize(data.company.size || 'SMALL');
        setSlaHours(String(data.company.slaHours ?? 72));
        setPlan(data.company.plan || '');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (B2B_CONSOLE_PREVIEW) {
      toast.info('Preview mode — request a demo to save company settings.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/b2b/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyName,
          industry,
          country,
          size,
          slaHours: Number(slaHours) || 72,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Save failed');
        return;
      }
      toast.success('Saved');
      if (data.company) {
        setCompanyName(data.company.name);
        setIndustry(data.company.industry);
        setCountry(data.company.country);
        setSize(data.company.size);
        setSlaHours(String(data.company.slaHours));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/50">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        {plan ? (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{plan}</p>
        ) : null}
      </div>

      <GlowCard className="space-y-5 p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('companyInfo')}</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">{t('companyName')}</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="glass-input"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm text-[var(--text-muted)]">{t('industry')}</Label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="glass-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-[var(--text-muted)]">{t('country')}</Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="glass-input"
              />
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
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlowCard>

      <GlowCard className="space-y-4 p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('slaSettings')}</h2>
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">{t('slaHours')}</Label>
          <Input
            type="number"
            value={slaHours}
            onChange={(e) => setSlaHours(e.target.value)}
            className="glass-input"
          />
        </div>
      </GlowCard>

      <div className="flex justify-end">
        <Button
          onClick={() => void handleSave()}
          disabled={saving}
          className="glass-button cursor-pointer"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : null}
          {t('save')}
        </Button>
      </div>
    </div>
  );
}
