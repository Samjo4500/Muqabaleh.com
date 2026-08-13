import Image from 'next/image';
import Link from 'next/link';
import {
  Briefcase,
  Building2,
  Mic2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { localePath } from '@/i18n/navigation';

const JEANNIE_SRC = '/images/hero-interview.webp';
const JEANNIE_SCENE = '/images/hero-jeannie-riyadh.webp';

type Service = {
  icon: typeof Mic2;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  href: string;
};

const SERVICES: Service[] = [
  {
    icon: Mic2,
    titleEn: 'Jeannie — AI interview coach',
    titleAr: 'جيني — مدربة مقابلات بالذكاء الاصطناعي',
    bodyEn:
      'Practice live interviews in Arabic or English. Dialects and accents welcome. Real-time dialogue, structured feedback, and a private scorecard until you choose to share.',
    bodyAr:
      'تدرّب على مقابلات حية بالعربية أو الإنجليزية. اللهجات مرحّب بها. حوار فوري، ملاحظات منظمة، وتقرير خاص حتى تقرر المشاركة.',
    href: '/interview/prequal',
  },
  {
    icon: ShieldCheck,
    titleEn: 'Verified interview passport',
    titleAr: 'جواز مقابلة موثّق',
    bodyEn:
      'Turn practice into proof: a 0–100 hire-ready score with clarity, confidence, structure, and bilingual signal — plus a public verify link and QR when you publish.',
    bodyAr:
      'حوّل التدريب إلى دليل: درجة جاهزية ٠–١٠٠ للوضوح والثقة والهيكل والإشارة ثنائية اللغة — مع رابط تحقق وQR عند النشر.',
    href: '/verify',
  },
  {
    icon: Briefcase,
    titleEn: 'MENA jobs board',
    titleAr: 'لوحة وظائف المنطقة',
    bodyEn:
      'Browse real employer and public ATS roles across the region. Practice for the company with Jeannie, then apply yourself on their site — we never auto-apply.',
    bodyAr:
      'تصفّح أدوار أصحاب العمل وواجهات ATS العامة في المنطقة. تدرّب للشركة مع جيني، ثم قدّم بنفسك على موقعها — بلا تقديم تلقائي.',
    href: '/jobs',
  },
  {
    icon: Building2,
    titleEn: 'Hiring desk for companies',
    titleAr: 'مكتب توظيف للشركات',
    bodyEn:
      'Screen with verified passports, invite candidates to Jeannie first-rounds, and decide with signal — not inbox noise. Built for MENA hiring teams.',
    bodyAr:
      'صفِّ المرشحين بجوازات موثّقة، ادعُهم لجولات جيني الأولى، واتخذ القرار بإشارة واضحة — لا ضجيج بريد. مصمّم لفرق التوظيف في المنطقة.',
    href: '/business',
  },
  {
    icon: Users,
    titleEn: 'Expert human interviews',
    titleAr: 'مقابلات بشرية مع خبراء',
    bodyEn:
      'Optional live sessions with professional interviewers when teams want a human round on top of Jeannie’s AI screen.',
    bodyAr:
      'جلسات حية اختيارية مع مقابلين محترفين عندما تريد الفرق جولة بشرية فوق فحص جيني بالذكاء الاصطناعي.',
    href: '/human-interviews',
  },
];

export function CompanyProfileView({ locale }: { locale: string }) {
  const isAr = locale !== 'en';

  return (
    <div className="mq-atelier min-h-screen">
      <JobPortalChrome
        backHref="/"
        backLabel={{ en: 'Home', ar: 'الرئيسية' }}
      />

      {/* Hero: brand + Jeannie — one composition */}
      <section className="relative min-h-[88vh] overflow-hidden">
        <Image
          src={JEANNIE_SRC}
          alt={isAr ? 'جيني — مدربة المقابلات في مقابلة' : 'Jeannie — Muqabaleh interview coach'}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_20%]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-[#05080f]/75 to-[#05080f]/35"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#05080f]/80 via-transparent to-[#05080f]/40"
          aria-hidden
        />

        <div className="mq-wrap relative flex min-h-[88vh] flex-col justify-end pb-14 pt-28 md:pb-20 md:pt-32">
          <BrandLogo
            size="hero"
            priority
            className="mb-8 drop-shadow-[0_12px_40px_rgba(45,212,191,0.35)]"
          />
          <p className="mq-kicker mb-3 text-teal-200/90">
            {isAr ? 'ملف الشركة · الخدمات' : 'Company profile · Services'}
          </p>
          <h1 className="mq-display max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
            {isAr ? (
              <>
                مقابلة — جاهزية المقابلة
                <span className="mt-2 block bg-gradient-to-r from-teal-200 to-amber-200 bg-clip-text text-transparent">
                  مع جيني
                </span>
              </>
            ) : (
              <>
                Muqabaleh — interview readiness
                <span className="mt-2 block bg-gradient-to-r from-teal-200 to-amber-200 bg-clip-text text-transparent">
                  with Jeannie
                </span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            {isAr
              ? 'منصة عربية أولاً للتدرّب على مقابلات العمل بالذكاء الاصطناعي، وتوثيق الجاهزية، ودعم التوظيف في الشرق الأوسط وشمال أفريقيا.'
              : 'Arabic-first platform for AI interview practice, verified readiness passports, and hiring support across MENA.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localePath('/interview/prequal', locale)}
              className="mq-btn mq-btn-primary min-h-12 px-6 text-sm font-bold"
            >
              {isAr ? 'تدرّب مع جيني' : 'Practice with Jeannie'}
            </Link>
            <Link
              href={localePath('/business', locale)}
              className="mq-btn mq-btn-ghost min-h-12 px-6 text-sm font-bold"
            >
              {isAr ? 'للشركات' : 'For companies'}
            </Link>
            <a
              href="/muqabaleh-company-profile.pdf"
              className="mq-btn mq-btn-ghost min-h-12 px-6 text-sm font-bold"
              download
            >
              {isAr ? 'تحميل PDF' : 'Download PDF'}
            </a>
          </div>
        </div>
      </section>

      {/* Jeannie intro — one job */}
      <section className="mq-section border-t border-white/10">
        <div className="mq-wrap grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm md:aspect-[5/6]">
            <Image
              src={JEANNIE_SCENE}
              alt={isAr ? 'جيني في سياق المنطقة' : 'Jeannie in a MENA context'}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05080f]/50 to-transparent"
              aria-hidden
            />
          </div>
          <div>
            <p className="mq-kicker mb-3">{isAr ? 'جيني' : 'Jeannie'}</p>
            <h2 className="mq-display text-3xl font-bold text-white md:text-4xl">
              {isAr
                ? 'وكيلة واحدة من التدريب إلى القرار'
                : 'One agent from practice to decision'}
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/60">
              {isAr
                ? 'جيني تُجري المقابلة، تبني جواز الجاهزية، وتساعد المرشحين وفرق التوظيف على التحرك بإشارة واضحة — بالعربية والإنجليزية، مع احترام اللهجات.'
                : 'Jeannie runs the interview, builds the readiness passport, and helps candidates and hiring teams move on clear signal — in Arabic and English, with fair dialect scoring.'}
            </p>
          </div>
        </div>
      </section>

      {/* Services focus */}
      <section className="mq-section border-t border-white/10" id="services">
        <div className="mq-wrap mx-auto max-w-4xl">
          <p className="mq-kicker mb-3">{isAr ? 'ماذا نقدّم' : 'What we offer'}</p>
          <h2 className="mq-display text-3xl font-bold text-white md:text-4xl">
            {isAr ? 'خدماتنا' : 'Our services'}
          </h2>
          <p className="mt-3 max-w-2xl text-white/55">
            {isAr
              ? 'خمس قدرات مترابطة — بدون ضجيج لوحة وظائف عشوائية.'
              : 'Five connected capabilities — without spammy job-board noise.'}
          </p>

          <ol className="mt-12 space-y-0 divide-y divide-white/10 border-y border-white/10">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.href} className="py-8 md:py-10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
                    <div className="flex shrink-0 items-center gap-3 text-teal-300/90">
                      <span className="mq-display text-sm font-bold text-white/35">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <Icon size={22} strokeWidth={1.5} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mq-display text-xl font-bold text-white md:text-2xl">
                        {isAr ? s.titleAr : s.titleEn}
                      </h3>
                      <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/60">
                        {isAr ? s.bodyAr : s.bodyEn}
                      </p>
                      <Link
                        href={localePath(s.href, locale)}
                        className="mt-4 inline-flex text-sm font-semibold text-teal-300 hover:text-teal-200"
                      >
                        {isAr ? 'اعرف المزيد →' : 'Learn more →'}
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Who we serve */}
      <section className="mq-section border-t border-white/10">
        <div className="mq-wrap mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
          <div>
            <p className="mq-kicker mb-3">{isAr ? 'للمرشحين' : 'For candidates'}</p>
            <h2 className="mq-display text-2xl font-bold text-white md:text-3xl">
              {isAr ? 'ادخل واثق. اخرج جاهز.' : 'Walk in prepared. Walk out ready.'}
            </h2>
            <p className="mt-3 text-white/60">
              {isAr
                ? 'تدرّب مع جيني، احصل على جواز موثّق، وقدّم بنفسك على مواقع الشركات من لوحة وظائفنا.'
                : 'Practice with Jeannie, earn a verified passport, and apply yourself on company sites from our jobs board.'}
            </p>
          </div>
          <div>
            <p className="mq-kicker mb-3">{isAr ? 'لأصحاب العمل' : 'For employers'}</p>
            <h2 className="mq-display text-2xl font-bold text-white md:text-3xl">
              {isAr ? 'وظّف بإشارة لا بضوضاء.' : 'Hire with signal, not noise.'}
            </h2>
            <p className="mt-3 text-white/60">
              {isAr
                ? 'استخدم جوازات موثّقة وجولات جيني الأولى لتقصير المسار إلى قرار توظيف أوضح.'
                : 'Use verified passports and Jeannie first-rounds to shorten the path to a clearer hire decision.'}
            </p>
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="mq-section border-t border-white/10 pb-20">
        <div className="mq-wrap mx-auto max-w-3xl text-center">
          <BrandLogo size="lg" className="mx-auto mb-8 opacity-90" />
          <h2 className="mq-display text-3xl font-bold text-white md:text-4xl">
            {isAr ? 'لنبدأ حواراً' : 'Let’s talk'}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/55">
            {isAr
              ? 'للشراكات والعروض التوضيحية للشركات: تواصل معنا أو اطلب عرضاً.'
              : 'For partnerships and company demos: reach out or request a walkthrough.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={localePath('/request-demo', locale)}
              className="mq-btn mq-btn-primary min-h-12 px-6 text-sm font-bold"
            >
              {isAr ? 'اطلب عرضاً' : 'Request a demo'}
            </Link>
            <a
              href="mailto:hello@muqabaleh.com"
              className="mq-btn mq-btn-ghost min-h-12 px-6 text-sm font-bold"
            >
              hello@muqabaleh.com
            </a>
          </div>
          <p className="mt-10 text-sm text-white/35">
            muqabaleh.com · {isAr ? 'مقابلة' : 'Muqabaleh'} · Jeannie
          </p>
        </div>
      </section>

      <CrystalFooter />
    </div>
  );
}
