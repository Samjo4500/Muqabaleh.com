'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Official Muqabaleh mark used across the product (mic + bilingual wordmark). */
const LOGO_HERO = '/images/logos/v2-balanced-a-T.webp';
const LOGO_NAV = '/images/logos/v2-balanced-a-T-sm.webp';

export function BrandLogo({
  size = 'md',
  className,
  priority = false,
}: {
  size?: 'sm' | 'nav' | 'md' | 'lg' | 'hero';
  className?: string;
  priority?: boolean;
}) {
  const dims = {
    sm: { w: 140, h: 70, className: 'h-9 w-auto' },
    // Tall enough to read in the header, still fits inside the 68px ribbon
    nav: { w: 260, h: 120, className: 'h-[52px] w-auto md:h-[56px]' },
    md: { w: 180, h: 90, className: 'h-11 w-auto' },
    lg: { w: 260, h: 130, className: 'h-16 w-auto' },
    hero: { w: 560, h: 280, className: 'h-auto w-[15rem] sm:w-[19rem] md:w-[23rem]' },
  }[size];

  const src = size === 'hero' || size === 'lg' ? LOGO_HERO : LOGO_NAV;

  return (
    <Image
      src={src}
      alt="Muqabaleh | مقابلة"
      width={dims.w}
      height={dims.h}
      priority={priority}
      sizes={
        size === 'hero'
          ? '(max-width: 640px) 240px, (max-width: 768px) 304px, 368px'
          : '(max-width: 768px) 140px, 180px'
      }
      className={cn('object-contain', dims.className, className)}
    />
  );
}
