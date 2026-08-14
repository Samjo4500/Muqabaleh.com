'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { localePath } from '@/i18n/navigation';

const BIO_EN = [
  'Over the past three decades, I have had the privilege of operating at the intersection of global commerce and human capital — an experience that has been as formative as it has been humbling.',
  'Thirty years across North America, Europe, and the Middle East, working alongside iconic global brands and household names that have shaped modern industry. Three continents, three distinct commercial cultures, and one immutable truth: the disparity between raw competence and the ability to articulate it.',
  'I have mentored and developed hundreds of professionals throughout my career. I have witnessed exceptional candidates falter in interview rooms where they rightfully belonged, while less qualified counterparts advanced simply because they understood how to perform. The differential was never intellectual capacity. It was preparation. And across MENA, that preparation remains virtually nonexistent in Arabic.',
  'So I did what I have done twice before. I built an enterprise to solve it.',
];

const BIO_AR = [
  'على مدى العقود الثلاثة الماضية، حظيت بشرف العمل عند تقاطع التجارة العالمية ورأس المال البشري — تجربة بقدر ما شكّلتني كانت متواضعة.',
  'ثلاثون عاماً عبر أمريكا الشمالية وأوروبا والشرق الأوسط، أعمل إلى جانب علامات عالمية أيقونية وأسماء مألوفة شكّلت الصناعة الحديثة. ثلاث قارات، وثلاث ثقافات تجارية متمايزة، وحقيقة واحدة لا تتبدل: الفجوة بين الكفاءة الخام والقدرة على التعبير عنها.',
  'أرشدت وطوّرت مئات المهنيين على مدار مسيرتي. شهدت مرشحين استثنائيين يتعثرون في غرف المقابلات التي كانوا ينتمون إليها بحق، بينما يتقدم نظراء أقل تأهيلاً لمجرد أنهم فهموا كيف يؤدون. الفارق لم يكن يوماً في القدرة الفكرية. كان في التحضير. وفي منطقة الشرق الأوسط وشمال أفريقيا، لا يزال هذا التحضير شبه معدوم بالعربية.',
  'ففعلت ما فعلته مرتين من قبل. بنيت مؤسسة لحلّ ذلك.',
];

export default function AboutContent() {
  const locale = useLocale();
  const isAr = locale !== 'en';
  const bio = isAr ? BIO_AR : BIO_EN;

  return (
    <AtelierShell>
      <article className="mq-section pb-8 pt-10">
        <div className="mq-wrap mx-auto max-w-3xl">
          <p className="mq-kicker mb-3">{isAr ? 'الشركة' : 'Company'}</p>
          <h1 className="mq-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {isAr ? 'عن مقابلة' : 'About Muqabaleh'}
          </h1>
        </div>
      </article>

      <section className="mq-section border-t border-white/10 pt-0">
        <div className="mq-wrap mx-auto grid max-w-3xl gap-8 md:grid-cols-[auto_1fr] md:items-start">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border border-teal-300/30 bg-gradient-to-br from-teal-400/20 to-amber-200/10 text-3xl font-bold text-teal-100">
            SJ
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-teal-200">
              {isAr ? 'المؤسس والرئيس التنفيذي' : 'Founder & CEO'}
            </p>
            <h2 className="mq-display mt-1 text-2xl font-bold text-white md:text-3xl">Sam Jo</h2>
            <div className="mt-5 space-y-5 text-base leading-relaxed text-white/70">
              {bio.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mq-section border-t border-white/10">
        <div className="mq-wrap mx-auto max-w-3xl text-center">
          <p className="mq-kicker mb-3">{isAr ? 'رسالتنا' : 'Mission'}</p>
          <p className="mq-display text-3xl font-bold text-white md:text-5xl">
            {isAr ? 'ادخل واثق. اخرج ناجح.' : 'Walk in prepared. Walk out hired.'}
          </p>
          <Link
            href={localePath('/#pricing', locale)}
            className="mq-btn mq-btn-on-dark mq-btn-shimmer mt-8 inline-flex"
          >
            {isAr ? 'ابدأ التدريب' : 'Start practicing'}
          </Link>
        </div>
      </section>
    </AtelierShell>
  );
}
