import Link from 'next/link';
import { localePath } from '@/i18n/navigation';

export type Crumb = {
  label: string;
  href?: string;
};

export function PageBreadcrumbs({
  locale,
  items,
}: {
  locale: string;
  items: Crumb[];
}) {
  return (
    <nav aria-label={locale === 'en' ? 'Breadcrumb' : 'مسار التنقل'} className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/45">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="inline-flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden className="text-white/25">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={localePath(item.href, locale)}
                  className="hover:text-teal-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-white/70' : undefined} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
