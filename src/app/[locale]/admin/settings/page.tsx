'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlowCard } from '@/components/brand';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Save } from 'lucide-react';

type EnvKey = {
  name: string;
  configured: boolean;
};

const envKeys: EnvKey[] = [
  { name: 'NEXTAUTH_URL', configured: true },
  { name: 'DATABASE_URL', configured: true },
  { name: 'PAYPAL_CLIENT_ID', configured: true },
  { name: 'PAYPAL_SECRET', configured: true },
  { name: 'PAYPAL_ENV', configured: true },
  { name: 'LLM_API_KEY', configured: true },
  { name: 'TTS_API_KEY', configured: false },
  { name: 'EMAIL_PROVIDER', configured: false },
];

type PackagePrice = {
  key: string;
  defaultPrice: number;
};

const packages: PackagePrice[] = [
  { key: 'pkgSession1', defaultPrice: 19 },
  { key: 'pkgSession3', defaultPrice: 49 },
  { key: 'pkgSession5', defaultPrice: 79 },
  { key: 'pkgVip', defaultPrice: 149 },
];

export default function SettingsPage() {
  const t = useTranslations('adminPanel.settings');
  const [prices, setPrices] = useState<number[]>(packages.map((p) => p.defaultPrice));
  const [sla, setSla] = useState('يجب إكمال المقابلة خلال 72 ساعة من تاريخ التعيين. في حال عدم الالتزام، يتم إعادة إسناد المقابلة تلقائياً.');
  const [commission, setCommission] = useState('35');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        {t('title')}
      </h1>

      {/* Environment Keys */}
      <GlowCard>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('envKeys')}
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[var(--text-muted)]">{t('envKey')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('envStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {envKeys.map((k, i) => (
                <TableRow key={i} className="border-white/[0.06] hover:bg-white/[0.02]">
                  <TableCell className="font-mono text-sm text-[var(--text-primary)]">{k.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={k.configured
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }
                    >
                      {k.configured ? t('envConfigured') : t('envNotConfigured')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlowCard>

      {/* Package Pricing */}
      <GlowCard>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('packagePricing')}
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[var(--text-muted)]">{t('package')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('price')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((p, i) => (
                <TableRow key={i} className="border-white/[0.06] hover:bg-white/[0.02]">
                  <TableCell className="font-medium text-[var(--text-primary)]">{t(p.key as 'pkgSession1')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-gold">$</span>
                      <Input
                        type="number"
                        value={prices[i]}
                        onChange={(e) => {
                          const copy = [...prices];
                          copy[i] = parseFloat(e.target.value) || 0;
                          setPrices(copy);
                        }}
                        className="w-28 glass-input font-mono"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlowCard>

      {/* Platform Settings */}
      <GlowCard>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('platformSettings')}
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">{t('slaText')}</Label>
            <Textarea
              value={sla}
              onChange={(e) => setSla(e.target.value)}
              placeholder={t('slaPlaceholder')}
              className="glass-input min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">{t('commission')}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder={t('commissionPlaceholder')}
                className="w-28 glass-input font-mono"
              />
              <span className="text-[var(--text-muted)]">%</span>
            </div>
          </div>
        </div>
      </GlowCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2 bg-gold text-void hover:bg-gold-hover font-bold">
          <Save size={18} strokeWidth={1.75} />
          {t('save')}
        </Button>
      </div>
    </div>
  );
}
