'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Branding = {
  name: string;
  contactEmail: string;
  customDomain: string | null;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  supportEmail: string | null;
  slug: string;
  status: string;
};

export default function Page() {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Prefer live partner branding from demo/API when available via partner resolve
    void fetch('/api/partner/resolve?slug=atlas-talent')
      .then((r) => r.json())
      .then((d) => {
        if (d.partner) {
          setBranding({
            name: d.partner.name,
            contactEmail: d.partner.contactEmail,
            customDomain: d.partner.customDomain,
            logoUrl: d.partner.logoUrl,
            primaryColor: d.partner.primaryColor,
            accentColor: d.partner.accentColor,
            supportEmail: d.partner.supportEmail,
            slug: d.partner.slug,
            status: d.partner.status,
          });
        }
      });
  }, []);

  const save = async () => {
    if (!branding) return;
    // Persist via demo partner branding endpoint when logged in as super admin
    // Falls back to messaging ops to update after provision
    setMsg('Open the partner console Branding studio as the partner admin to persist live changes. This panel previews the active partner brand.');
  };

  if (!branding) {
    return (
      <div className="p-6">
        <AdminPageHeader
          title={{ ar: 'العلامة البيضاء', en: 'Whitelabel' }}
          description={{
            ar: 'لا يوجد شريك مفعّل بعد — وافق على طلب ثم اضبط الهوية من لوحة الشريك.',
            en: 'No active partner yet — approve an application, then tune brand in the partner console.',
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title={{ ar: 'العلامة البيضاء', en: 'Whitelabel' }}
        description={{
          ar: 'معاينة هوية الشريك النشط. التعديل الحي يتم من لوحة الشريك.',
          en: 'Preview the active partner brand. Live edits happen in the partner console.',
        }}
      />

      <div className="grid max-w-3xl gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        {(
          [
            ['name', 'Brand name'],
            ['slug', 'Slug'],
            ['contactEmail', 'Contact email'],
            ['customDomain', 'Custom domain'],
            ['logoUrl', 'Logo URL'],
            ['primaryColor', 'Primary'],
            ['accentColor', 'Accent'],
            ['supportEmail', 'Support email'],
            ['status', 'Status'],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label>{label}</Label>
            <Input
              value={String(branding[key] ?? '')}
              onChange={(e) => setBranding({ ...branding, [key]: e.target.value })}
              readOnly={key === 'slug' || key === 'status'}
            />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Button onClick={save}>Save / guidance</Button>
          {msg ? <p className="text-sm text-white/50">{msg}</p> : null}
        </div>
      </div>
    </div>
  );
}
