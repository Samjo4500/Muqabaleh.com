'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L, type Bi } from '@/lib/admin/labels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export type ConfigField =
  | { key: string; label: Bi; type: 'text' | 'textarea' | 'number' | 'password'; value?: string }
  | { key: string; label: Bi; type: 'toggle'; value?: boolean }
  | { key: string; label: Bi; type: 'select'; value?: string; options: { value: string; label: string }[] };

export function AdminConfigPanel({
  title,
  description,
  sections,
  onSave,
  footerNote,
}: {
  title: Bi;
  description?: Bi;
  sections: { title: Bi; fields: ConfigField[]; note?: Bi }[];
  onSave?: (values: Record<string, string | boolean>) => Promise<void> | void;
  footerNote?: Bi;
}) {
  const initial: Record<string, string | boolean> = {};
  for (const s of sections) {
    for (const f of s.fields) {
      if (f.type === 'toggle') initial[f.key] = Boolean(f.value);
      else initial[f.key] = String(f.value ?? '');
    }
  }
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave?.(values);
      // Persist locally for operational review when no backend key store yet
      window.localStorage.setItem(`muqabaleh-admin-config:${title.en}`, JSON.stringify(values));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <Button type="button" size="sm" onClick={() => void save()} disabled={saving}>
            <BiInline ar={saving ? L.loading.ar : L.save.ar} en={saving ? L.loading.en : L.save.en} />
          </Button>
        }
      />
      {saved ? (
        <p className="mb-4 text-sm text-emerald-400">
          <BiInline ar={L.success.ar} en={L.success.en} />
        </p>
      ) : null}

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.title.en}
            className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <BiLabel ar={section.title.ar} en={section.title.en} />
              {section.note ? (
                <Badge variant="outline">
                  <BiInline ar={section.note.ar} en={section.note.en} />
                </Badge>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => (
                <label key={field.key} className="block space-y-2">
                  <BiLabel ar={field.label.ar} en={field.label.en} size="sm" />
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={String(values[field.key] ?? '')}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="min-h-28"
                    />
                  ) : field.type === 'toggle' ? (
                    <div className="flex items-center gap-3 pt-1">
                      <Switch
                        checked={Boolean(values[field.key])}
                        onCheckedChange={(checked) => setValues((v) => ({ ...v, [field.key]: checked }))}
                      />
                      <span className="text-sm text-[var(--text-muted)]">
                        {values[field.key] ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      className="flex h-10 w-full rounded-md border border-white/10 bg-transparent px-3 text-sm"
                      value={String(values[field.key] ?? '')}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    >
                      {field.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                      value={String(values[field.key] ?? '')}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    />
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
      {footerNote ? (
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          <BiInline ar={footerNote.ar} en={footerNote.en} />
        </p>
      ) : null}
    </div>
  );
}
