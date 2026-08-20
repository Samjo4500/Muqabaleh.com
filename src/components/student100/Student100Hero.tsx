import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import {
  MENA_CAPITALS,
  MENA_COAST,
  MENA_MAP_VIEW,
  MENA_ROUTE,
  pointsToPath,
  projectMena,
} from '@/lib/student100/mena-map';

const COAST = pointsToPath(MENA_COAST, true);
const ROUTE = pointsToPath(MENA_ROUTE, false);

/** Full-bleed MENA map with floating capitals, glowing wordmark, and apply CTA. */
export function Student100Hero({
  locale,
  offer,
  cta,
  ctaHref,
}: {
  locale: string;
  offer: string;
  cta: string;
  ctaHref: string;
}) {
  const isAr = locale === 'ar';

  return (
    <section className="s100-hero" aria-label={offer}>
      <div className="s100-hero-stage">
        <svg
          className="s100-hero-map"
          viewBox={`0 0 ${MENA_MAP_VIEW.width} ${MENA_MAP_VIEW.height}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={isAr ? 'عواصم الشرق الأوسط وشمال أفريقيا' : 'MENA capital cities'}
        >
          <defs>
            <linearGradient id="s100-land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0d1c24" />
              <stop offset="100%" stopColor="#081018" />
            </linearGradient>
            <filter id="s100-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="#070b14" />
          <path d={COAST} fill="url(#s100-land)" />
          <path
            className="s100-stroke"
            d={COAST}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="1.15"
            opacity="0.7"
            filter="url(#s100-glow)"
          />
          <path
            className="s100-route"
            d={ROUTE}
            fill="none"
            stroke="#e8c97a"
            strokeWidth="1.05"
            opacity="0.45"
          />

          {MENA_CAPITALS.map((city, i) => {
            const { x, y } = projectMena(city.lon, city.lat);
            const delay = { animationDelay: `${i * 0.14}s` };
            const labelX = x + (city.dx ?? 0);
            const labelY = y + (city.dy ?? -12);
            const name = isAr ? city.nameAr : city.name;
            return (
              <g key={city.code} className="s100-city" style={delay}>
                <circle className="s100-pin-ring" cx={x} cy={y} r="8" style={delay} />
                <circle className="s100-pin" cx={x} cy={y} r="2.5" style={delay} />
                <text
                  className="s100-city-label"
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  direction={isAr ? 'rtl' : 'ltr'}
                >
                  {name}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="s100-hero-center">
          <div className="mq-logo-glow relative inline-flex">
            <div
              className="absolute inset-[-22%] rounded-full bg-[radial-gradient(circle,rgba(232,201,122,0.28)_0%,rgba(45,212,191,0.18)_42%,transparent_70%)]"
              aria-hidden
            />
            <BrandLogo
              size="lg"
              priority
              className="s100-hero-logo relative drop-shadow-[0_10px_32px_rgba(45,212,191,0.28)]"
            />
          </div>
          <p className="s100-hero-offer">{offer}</p>
          <a href={ctaHref} className="mq-btn mq-btn-on-dark mq-btn-shimmer s100-hero-cta">
            {cta}
          </a>
        </div>
      </div>
    </section>
  );
}
