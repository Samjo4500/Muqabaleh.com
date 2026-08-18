import { cn } from '@/lib/utils';

/** Enhanced Muqabaleh wordmark (mic + bilingual) — HQ master for all surfaces. */
const LOGO_NAV = '/images/logos/muqabaleh-wordmark-nav.webp';

export function BrandLogo({
  size = 'md',
  className,
  priority = false,
  loading,
}: {
  size?: 'sm' | 'nav' | 'md' | 'lg' | 'hero';
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}) {
  const dims = {
    sm: { w: 160, h: 84, className: 'h-10 w-auto' },
    nav: { w: 300, h: 158, className: 'h-[60px] w-auto md:h-[68px]' },
    md: { w: 300, h: 158, className: 'h-[60px] w-auto' },
    lg: { w: 360, h: 190, className: 'h-[72px] w-auto md:h-20' },
    hero: {
      w: 400,
      h: 210,
      className: 'h-auto w-[17rem] sm:w-[21rem] md:w-[25rem]',
    },
  }[size];

  return (
    // Native img — next/image srcset was requesting 1400w for a ~240px logo.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_NAV}
      alt="Muqabaleh | مقابلة"
      width={dims.w}
      height={dims.h}
      decoding="async"
      loading={loading ?? (priority ? 'eager' : undefined)}
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn('object-contain', dims.className, className)}
    />
  );
}
