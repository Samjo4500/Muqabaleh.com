import {
  HERO_LCP_DESKTOP,
  HERO_LCP_MOBILE,
  HERO_LCP_TABLET,
} from '@/lib/perf/hero-media';

/**
 * LCP hero — native picture so mobile gets the 19KB 768w file, not /_next/image?w=1400.
 * Do not wrap this in framer-motion (opacity/scale delays Largest Contentful Paint).
 * Do not emit image preloads from this component — they hoist, duplicate, and fight LCP.
 * The homepage preloads only the 768w file via react-dom preload().
 */
export function HeroLcpImage({ alt, objectPosition }: { alt: string; objectPosition: string }) {
  return (
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
  );
}
