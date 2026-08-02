'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label, className = '' }: BackButtonProps) {
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const defaultLabel = label || (isRTL ? 'رجوع' : 'Back');

  const handleClick = () => {
    if (href) {
      window.location.href = href;
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-[var(--gold-hover)] transition-colors ${className}`}
    >
      <ArrowRight
        size={16}
        strokeWidth={1.75}
        className={isRTL ? '' : 'rotate-180'}
      />
      <span>{defaultLabel}</span>
    </button>
  );
}
