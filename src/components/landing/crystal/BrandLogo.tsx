'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

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
    sm: { w: 36, h: 36, className: 'h-9 w-9' },
    md: { w: 44, h: 44, className: 'h-11 w-11' },
    lg: { w: 64, h: 64, className: 'h-16 w-16' },
    hero: { w: 220, h: 220, className: 'h-[7.5rem] w-[7.5rem] sm:h-40 sm:w-40 md:h-48 md:w-48' },
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
