'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Download, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Candidate = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  level: string;
  headline: string | null;
  location: string | null;
  industry: string | null;
  skills: string[];
  yearsExperience: number | null;
  photoUrl: string | null;
  hasCv: boolean;
  cvAssetId: string | null;
  cvFileName: string | null;
  muqabalehScore: number | null;
  phone: string | null;
  linkedInUrl: string | null;
  openToWork: boolean;
};

export default function B2BTalentPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  async function load(search = q) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(`/api/b2b/talent?${params.toString()}`);
      const data = await res.json();
      setCandidates(data.candidates || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {isAr ? 'قاعدة المواهب' : 'Talent pool'}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {isAr
            ? 'مرشّحون سجّلوا لفرص حالية ومستقبلية مع سيرة وصورة وملف مهني.'
            : 'Candidates who registered for current and future roles with CV, photo, and profile.'}
        </p>
      </div>

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="glass-input ps-9"
            placeholder={
              isAr ? 'ابحث بالدور أو المهارة أو الاسم…' : 'Search role, skill, or name…'
            }
          />
        </div>
        <Button type="submit" className="glass-button cursor-pointer">
          {isAr ? 'بحث' : 'Search'}
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16 text-[var(--text-muted)]">
          <Loader2 className="animate-spin" />
        </div>
      ) : candidates.length === 0 ? (
        <p className="rounded-xl border border-white/[0.08] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
          {isAr ? 'لا يوجد مرشّحون ظاهرون بعد.' : 'No visible candidates yet.'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
            >
              <div className="mb-3 flex items-start gap-3">
                {c.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.photoUrl}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                    {(c.name || c.email).slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-[var(--text-primary)]">
                    {c.name || c.email}
                  </h2>
                  <p className="truncate text-sm text-[var(--text-muted)]">
                    {c.headline || c.role} · {c.level}
                  </p>
                  <p className="text-xs text-[var(--text-faint)]">
                    {[c.location, c.industry].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {c.openToWork ? (
                  <span className="rounded-md border border-teal-400/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-300">
                    {isAr ? 'متاح' : 'Open'}
                  </span>
                ) : null}
              </div>

              {c.skills?.length ? (
                <ul className="mb-3 flex flex-wrap gap-1.5">
                  {c.skills.slice(0, 8).map((skill) => (
                    <li
                      key={skill}
                      className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-[var(--text-muted)]"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                <a href={`mailto:${c.email}`} className="text-teal-300 hover:underline">
                  {c.email}
                </a>
                {c.phone ? <span>{c.phone}</span> : null}
                {c.hasCv && c.cvAssetId ? (
                  <a
                    href={`/api/media/${c.cvAssetId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-teal-300 hover:underline"
                  >
                    <Download size={12} />
                    {c.cvFileName || 'CV'}
                  </a>
                ) : null}
                {typeof c.muqabalehScore === 'number' ? (
                  <span>
                    Score {c.muqabalehScore.toFixed(1)}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
