import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { GUIDE_COMPANIES, GUIDE_ROLES } from '@/lib/interview-guides/catalog';
import { bi } from '@/lib/interview-guides/content';
import { localePath } from '@/i18n/navigation';

const FEATURED_COMPANY_SLUGS = ['careem', 'noon', 'neom', 'stc', 'emirates', 'aramco'];
const FEATURED_ROLE_SLUGS = ['software-engineer', 'product-manager', 'data-scientist'];

export function PopularGuides({ locale }: { locale: string }) {
  const isAr = locale !== 'en';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const companies = FEATURED_COMPANY_SLUGS.map((s) =>
    GUIDE_COMPANIES.find((c) => c.slug === s),
  ).filter(Boolean);
  const roles = FEATURED_ROLE_SLUGS.map((s) => GUIDE_ROLES.find((r) => r.slug === s)).filter(
    Boolean,
  );

  return (
    <section
      className="mq-section relative py-16 md:py-20"
      aria-labelledby="popular-guides-heading"
    >
      <div className="mq-wrap mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mq-kicker mb-2">Muqabaleh</p>
            <h2
              id="popular-guides-heading"
              className="mq-display text-2xl font-bold text-white md:text-3xl"
            >
              {isAr ? 'أدلة مقابلات شائعة' : 'Popular Interview Guides'}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/55 md:text-base">
              {isAr
                ? 'تحضّر قبل التقديم — أسئلة ونصائح لأشهر الشركات والأدوار.'
                : 'Prepare before you apply — questions and tips for top companies and roles.'}
            </p>
          </div>
          <Link
            href={localePath('/interview-guide', locale)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200"
          >
            {isAr ? 'كل الأدلة' : 'All guides'}
            <Arrow size={16} />
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) =>
            c ? (
              <li key={c.slug}>
                <Link
                  href={localePath(`/interview-guide/${c.slug}`, locale)}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition hover:border-teal-300/30"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-300/80">
                    <BookOpen size={12} aria-hidden />
                    {isAr ? 'شركة' : 'Company'}
                  </span>
                  <span className="mq-display mt-2 text-base font-bold text-white group-hover:text-teal-100">
                    {isAr
                      ? `دليل مقابلة ${bi(locale, c.name)}`
                      : `${bi(locale, c.name)} interview guide`}
                  </span>
                </Link>
              </li>
            ) : null,
          )}
          {roles.map((r) =>
            r ? (
              <li key={r.slug}>
                <Link
                  href={localePath(`/interview-guide/role/${r.slug}`, locale)}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition hover:border-teal-300/30"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-200/80">
                    <BookOpen size={12} aria-hidden />
                    {isAr ? 'دور' : 'Role'}
                  </span>
                  <span className="mq-display mt-2 text-base font-bold text-white group-hover:text-teal-100">
                    {isAr
                      ? `دليل مقابلة ${bi(locale, r.name)}`
                      : `${bi(locale, r.name)} interview guide`}
                  </span>
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </section>
  );
}
