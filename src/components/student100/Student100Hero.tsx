import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import {
  MENA_CAPITALS,
  MENA_COAST,
  MENA_MAP_VIEW,
  MENA_ROUTE,
  pointsToPath,
  projectMena,
  scaleLonLat,
} from '@/lib/student100/mena-map';

const COAST = pointsToPath(MENA_COAST, true);
const CONTOUR_A = pointsToPath(scaleLonLat(MENA_COAST, 0.78), true);
const CONTOUR_B = pointsToPath(scaleLonLat(MENA_COAST, 0.58), true);
const ROUTE = pointsToPath(MENA_ROUTE, false);

function pinPath(x: number, y: number) {
  return `M${x} ${y - 16} c-5.2 0 -8.4 4.2 -8.4 8.6 0 6.4 8.4 15.4 8.4 15.4 s8.4 -9 8.4 -15.4 c0 -4.4 -3.2 -8.6 -8.4 -8.6 z`;
}

/** Compact MENA map with centered glowing wordmark and apply CTA. */
export function Student100Hero({
  offer,
  cta,
  ctaHref,
}: {
  offer: string;
  cta: string;
  ctaHref: string;
}) {
  return (
    <section className="s100-hero" aria-label={offer}>
      <div className="s100-hero-stage">
        <svg
          className="s100-hero-map"
          viewBox={`0 0 ${MENA_MAP_VIEW.width} ${MENA_MAP_VIEW.height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <pattern id="s100-star" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M24 4 L27 18 L41 18 L30 26 L34 40 L24 32 L14 40 L18 26 L7 18 L21 18 Z"
                fill="none"
                stroke="rgba(232,201,122,0.09)"
                strokeWidth="0.7"
              />
            </pattern>
            <linearGradient id="s100-land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0c1a22" />
              <stop offset="100%" stopColor="#081018" />
            </linearGradient>
            <filter id="s100-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="#070b14" />
          <rect width="100%" height="100%" fill="url(#s100-star)" />

          <path d={COAST} fill="url(#s100-land)" stroke="none" />
          <path
            className="s100-stroke"
            d={COAST}
            fill="none"
            stroke="#3dffb0"
            strokeWidth="1.6"
            filter="url(#s100-glow)"
          />
          <path
            className="s100-stroke s100-stroke-slow"
            d={CONTOUR_A}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="1"
            opacity="0.55"
          />
          <path
            className="s100-stroke"
            d={CONTOUR_B}
            fill="none"
            stroke="#5eead4"
            strokeWidth="0.7"
            opacity="0.35"
          />
          <path
            className="s100-route"
            d={ROUTE}
            fill="none"
            stroke="#e8c97a"
            strokeWidth="1.4"
            filter="url(#s100-glow)"
          />

          {MENA_CAPITALS.map((city, i) => {
            const { x, y } = projectMena(city.lon, city.lat);
            const delay = { animationDelay: `${i * 0.16}s` };
            return (
              <g key={city.code}>
                <circle className="s100-pin-ring" cx={x} cy={y - 2} r="11" style={delay} />
                <path className="s100-pin" d={pinPath(x, y)} style={delay} />
                <circle className="s100-pin-core" cx={x} cy={y - 9} r="2.4" style={delay} />
              </g>
            );
          })}
        </svg>

        <div className="s100-hero-center">
          <BrandLogo size="md" priority className="s100-hero-logo" />
          <p className="s100-hero-offer">{offer}</p>
          <a href={ctaHref} className="mq-btn mq-btn-primary s100-hero-cta">
            {cta}
          </a>
        </div>
      </div>
    </section>
  );
}
