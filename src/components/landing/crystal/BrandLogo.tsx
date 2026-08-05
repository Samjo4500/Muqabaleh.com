'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Official Muqabaleh mark used across the product (mic + bilingual wordmark). */
const LOGO_SRC = '/images/logos/v2-balanced-a-T.webp';

export function BrandLogo({
  size = 'md',
  className,
  priority = false,
}: {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  priority?: boolean;
}) {
  const dims = {
    sm: { w: 140, h: 70, className: 'h-9 w-auto' },
    md: { w: 180, h: 90, className: 'h-11 w-auto' },
    lg: { w: 260, h: 130, className: 'h-16 w-auto' },
    hero: { w: 560, h: 280, className: 'h-auto w-[15rem] sm:w-[19rem] md:w-[23rem]' },
  }[size];

  return (
    <Image
      src={LOGO_SRC}
      alt="Muqabaleh | مقابلة"
      width={dims.w}
      height={dims.h}
      priority={priority}
      className={cn('object-contain', dims.className, className)}
    />
  );
}
