import { C, type Bi } from './copy';

const FACETS = [
  'mq-facet mq-facet-teal mq-facet-shape-soft',
  'mq-facet mq-facet-gold mq-facet-shape-wave',
  'mq-facet mq-facet-cyan mq-facet-shape-cap',
  'mq-facet mq-facet-amber mq-facet-shape-soft',
  'mq-facet mq-facet-rose mq-facet-shape-wave',
] as const;

function pick(bi: Bi, locale: string) {
  return locale === 'ar' ? bi.ar : bi.en;
}

/** Native details — no Radix Accordion or framer-motion on first load. */
export function CrystalFAQ({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const lang = isAr ? 'ar' : 'en';

  return (
    <section id="faq" className="mq-section scroll-mt-28">
      <div className="mq-wrap mx-auto max-w-3xl">
        <h2
          className="mq-display mb-10 text-3xl font-bold tracking-tight text-white md:text-5xl"
          dir={dir}
          lang={lang}
        >
          {pick(C.faq.title, locale)}
        </h2>

        <div className="space-y-3">
          {C.faq.items.map((item, i) => (
            <details
              key={item.q.en}
              className={`mq-panel relative overflow-hidden border-none px-5 ${FACETS[i % FACETS.length]}`}
            >
              <summary className="cursor-pointer list-none py-5 text-start text-sm font-semibold text-white marker:content-none md:text-base [&::-webkit-details-marker]:hidden">
                <span dir={dir} lang={lang}>
                  {pick(item.q, locale)}
                </span>
              </summary>
              <p className="relative pb-5 text-sm leading-relaxed text-white/65" dir={dir} lang={lang}>
                {pick(item.a, locale)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
