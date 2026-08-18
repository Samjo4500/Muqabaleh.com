import {
  HERO_LCP_DESKTOP,
  HERO_LCP_MOBILE,
  HERO_LCP_TABLET,
} from '@/lib/perf/hero-media';

/**
 * LCP hero — native picture so mobile gets the 19KB 768w file, not /_next/image?w=1400.
 * Do not wrap this in framer-motion (opacity/scale delays Largest Contentful Paint).
 */
export function HeroLcpImage({ alt, objectPosition }: { alt: string; objectPosition: string }) {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href={HERO_LCP_MOBILE}
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={HERO_LCP_TABLET}
        media="(min-width: 768px) and (max-width: 1279px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={HERO_LCP_DESKTOP}
        media="(min-width: 1280px)"
        fetchPriority="high"
      />
      <picture>
        <source media="(max-width: 767px)" srcSet={HERO_LCP_MOBILE} type="image/webp" />
        <source media="(max-width: 1279px)" srcSet={HERO_LCP_TABLET} type="image/webp" />
        <img
          src={HERO_LCP_DESKTOP}
          alt={alt}
          width={1280}
          height={1600}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover mq-hero-face"
          style={{ objectPosition }}
        />
      </picture>
    </>
  );
}
