'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';

const BOILERPLATE_EN =
  'Muqabaleh is the first AI-powered interview practice platform built for the MENA market. We help job seekers prepare for real interviews in Arabic and English, using questions from actual regional employers.';

const BOILERPLATE_AR =
  'مقابلة هي أول منصة للتدرّب على المقابلات بالذكاء الاصطناعي صُمّمت لسوق الشرق الأوسط وشمال أفريقيا. نساعد الباحثين عن عمل على الاستعداد لمقابلات حقيقية بالعربية والإنجليزية، بأسئلة من أصحاب عمل إقليميين فعليين.';

const FOUNDER_EN =
  'Over three decades at the intersection of global commerce and human capital — across North America, Europe, and the Middle East — I learned one immutable truth: the gap between raw competence and the ability to articulate it. I have mentored hundreds of professionals and watched exceptional candidates falter in rooms where they belonged, while less qualified counterparts advanced because they knew how to perform. The differential was never intellect. It was preparation. Across MENA, that preparation remains virtually nonexistent in Arabic. So I did what I have done twice before. I built an enterprise to solve it.';

const FOUNDER_AR =
  'على مدى ثلاثة عقود عند تقاطع التجارة العالمية ورأس المال البشري — عبر أمريكا الشمالية وأوروبا والشرق الأوسط — تعلّمت حقيقة لا تتبدل: الفجوة بين الكفاءة الخام والقدرة على التعبير عنها. أرشدت مئات المهنيين وشهدت مرشحين استثنائيين يتعثرون في غرف كانوا ينتمون إليها، بينما يتقدم أقل تأهيلاً لأنهم عرفوا كيف يؤدون. الفارق لم يكن في العقل. كان في التحضير. وفي المنطقة لا يزال هذا التحضير شبه معدوم بالعربية. فبنيت مؤسسة لحلّ ذلك.';

const COLORS = [
  { name: 'Teal', hex: '#2DD4BF' },
  { name: 'Sand', hex: '#E8C97A' },
  { name: 'Cyan', hex: '#67E8F9' },
  { name: 'Paper', hex: '#070B14' },
];

const SCREENSHOTS = [
  { en: 'Screenshot 1: Interview Interface', ar: 'لقطة ١: واجهة المقابلة' },
  { en: 'Screenshot 2: Verified Passport', ar: 'لقطة ٢: جواز موثّق' },
  { en: 'Screenshot 3: Interview Guides', ar: 'لقطة ٣: أدلة المقابلات' },
];

export default function PressContent() {
  const locale = useLocale();
  const isAr = locale !== 'en';

  return (
    <AtelierShell>
      <article className="mq-section pb-8 pt-10">
        <div className="mq-wrap mx-auto max-w-3xl">
          <p className="mq-kicker mb-3">{isAr ? 'الإعلام' : 'Media'}</p>
          <h1 className="mq-display text-4xl font-bold text-white sm:text-5xl">
            {isAr ? 'المركز الإعلامي' : 'Press'}
          </h1>
          <p className="mt-4 text-white/60">
            {isAr
              ? 'أصول العلامة، نبذة الشركة، وسيرة المؤسس للصحافة والشركاء.'
              : 'Brand assets, boilerplate, and founder bio for press and partners.'}
          </p>
        </div>
      </article>

      <section className="mq-section border-t border-white/10 pt-0">
        <div className="mq-wrap mx-auto max-w-3xl space-y-8">
          <div>
            <h2 className="mq-display text-2xl font-bold text-white">
              {isAr ? 'أصول العلامة' : 'Brand Assets'}
            </h2>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <BrandLogo size="lg" />
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="/images/logos/muqabaleh-wordmark.png"
                  download
                  className="mq-btn mq-btn-ghost text-sm"
                >
                  {isAr ? 'تحميل الشعار PNG' : 'Download logo PNG'}
                </a>
                <a href="/logo.svg" download className="mq-btn mq-btn-ghost text-sm">
                  {isAr ? 'تحميل SVG' : 'Download SVG'}
                </a>
              </div>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {COLORS.map((c) => (
                <li
                  key={c.hex}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <span
                    className="h-8 w-8 shrink-0 rounded-lg border border-white/15"
                    style={{ background: c.hex }}
                  />
                  <span className="text-sm text-white/80">
                    {c.name} · <span className="font-mono text-teal-200">{c.hex}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/images/hero-jeannie-doha.webp"
                alt={isAr ? 'جيني' : 'Jeannie'}
                width={1200}
                height={630}
                className="h-48 w-full object-cover object-top md:h-64"
              />
              <p className="px-4 py-3 text-sm text-white/50">
                {isAr ? 'جيني — مدربة المقابلات' : 'Jeannie — interview coach'}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mq-display text-2xl font-bold text-white">
              {isAr ? 'نبذة الشركة' : 'Company Boilerplate'}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              {isAr ? BOILERPLATE_AR : BOILERPLATE_EN}
            </p>
          </div>

          <div>
            <h2 className="mq-display text-2xl font-bold text-white">
              {isAr ? 'سيرة المؤسس' : 'Founder Bio'}
            </h2>
            <p className="mt-2 text-sm font-semibold text-teal-200">
              Sam Jo · {isAr ? 'المؤسس والرئيس التنفيذي' : 'Founder & CEO'}
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              {isAr ? FOUNDER_AR : FOUNDER_EN}
            </p>
          </div>

          <div>
            <h2 className="mq-display text-2xl font-bold text-white">
              {isAr ? 'لقطات المنتج' : 'Product Screenshots'}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {SCREENSHOTS.map((s) => (
                <div
                  key={s.en}
                  className="flex min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-4 text-center text-sm text-white/50"
                >
                  {isAr ? s.ar : s.en}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mq-display text-2xl font-bold text-white">
              {isAr ? 'تواصل' : 'Contact'}
            </h2>
            <p className="mt-3 text-white/70">
              {isAr ? 'للاستفسارات الإعلامية:' : 'For media inquiries:'}{' '}
              <Link href="mailto:press@muqabaleh.com" className="text-teal-300 hover:text-teal-200">
                press@muqabaleh.com
              </Link>
            </p>
          </div>
        </div>
      </section>
    </AtelierShell>
  );
}
