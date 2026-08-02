'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from 'next-intl';

export interface Crumb {
  label: string;
  href?: string; // no href = current page (not clickable)
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const Separator = isRTL ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-sm text-[var(--text-faint)] ${className}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="inline-flex items-center gap-1.5">
            {i > 0 && <Separator size={12} strokeWidth={1.5} />}
            {isLast || !item.href ? (
              <span className="text-[var(--text-muted)] font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
