'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { BiLabel, BiInline } from '@/components/admin/BiLabel';
import { L, type Bi } from '@/lib/admin/labels';
import { parentAdminPath } from '@/lib/admin/nav';
import { localePath } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

export function AdminPageHeader({
  title,
  description,
  actions,
  backHref,
}: {
  title: Bi;
  description?: Bi;
  actions?: React.ReactNode;
  /** Override auto parent back target */
  backHref?: string;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const parent = backHref ?? parentAdminPath(pathname);
  const href = localePath(parent, locale);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[var(--text-primary)] transition hover:border-white/20 hover:bg-white/[0.08]"
        >
          <ArrowRight size={16} strokeWidth={2} className="rtl:rotate-0" />
          <BiInline ar={L.back.ar} en={L.back.en} />
        </Link>
        <nav className="text-xs text-[var(--text-muted)]" aria-label="Breadcrumb">
          <BiInline ar={L.dashboard.ar} en={L.dashboard.en} />
          <span className="mx-1">›</span>
          <BiInline ar={title.ar} en={title.en} />
        </nav>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1>
            <BiLabel ar={title.ar} en={title.en} size="lg" className="[&>span:first-child]:text-2xl [&>span:first-child]:font-bold md:[&>span:first-child]:text-3xl" />
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              <BiInline ar={description.ar} en={description.en} />
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
