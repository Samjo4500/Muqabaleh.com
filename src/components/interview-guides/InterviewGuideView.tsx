import Link from 'next/link';
import { Briefcase, MapPin, Sparkles, Star } from 'lucide-react';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { ArticleJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/json-ld';
import { localePath } from '@/i18n/navigation';
import {
  HOW_TO_ANSWER_GENERIC,
  SALARY_DISCLAIMER,
  bi,
  companyGuideFaqs,
  interviewProcessSteps,
  roleGuideFaqs,
} from '@/lib/interview-guides/content';
import type { CompanyGuidePayload, RoleGuidePayload } from '@/lib/interview-guides/data';
import { jeanniePracticePath } from '@/lib/jobs/jeannie-practice';
import { SITE_URL } from '@/lib/seo';

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < n ? 'fill-amber-300 text-amber-300' : 'text-white/20'}
          aria-hidden
        />
      ))}
    </span>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-white/10 pt-10">
      <h2 className="mq-display text-xl font-bold text-white md:text-2xl">{title}</h2>
      <div className="mt-4 space-y-3 text-base leading-relaxed text-white/65">{children}</div>
    </section>
  );
}

type Props =
  | {
      kind: 'company';
      locale: string;
      data: CompanyGuidePayload;
      title: string;
      description: string;
    }
  | {
      kind: 'role';
      locale: string;
      data: RoleGuidePayload;
      title: string;
      description: string;
    };

export function InterviewGuideView(props: Props) {
  const { locale, title, description, kind } = props;
  const isAr = locale !== 'en';
  const prefix = locale === 'en' ? '/en' : '';

  const subjectName =
    kind === 'company'
      ? bi(locale, props.data.company.name)
      : bi(locale, props.data.role.name);

  const difficulty =
    kind === 'company' ? props.data.company.difficulty : props.data.role.difficulty;
  const salaryHint =
    kind === 'company'
      ? bi(locale, props.data.company.salaryHint)
      : bi(locale, props.data.role.salaryHint);
  const hook =
    kind === 'company'
      ? bi(locale, props.data.company.hook)
      : bi(locale, props.data.role.hook);
  const about =
    kind === 'company'
      ? bi(locale, props.data.company.about)
      : bi(locale, props.data.role.about);
  const culture =
    kind === 'company'
      ? bi(locale, props.data.company.cultureTips)
      : bi(locale, props.data.role.cultureTips);
  const openJobs = props.data.openJobs;
  const relatedJobs = props.data.relatedJobs;
  const publishedAt =
    kind === 'company' ? props.data.company.publishedAt : props.data.role.publishedAt;

  const practiceHref = localePath(
    jeanniePracticePath(
      kind === 'company'
        ? { company: props.data.company.name.en }
        : {
            role: props.data.role.name.en,
            company: undefined,
          },
    ),
    locale,
  );

  const path =
    kind === 'company'
      ? `/interview-guide/${props.data.company.slug}`
      : `/interview-guide/role/${props.data.role.slug}`;
  const pageUrl = `${SITE_URL}${prefix}${path}`;

  const questions =
    kind === 'company'
      ? [
          ...props.data.company.companyQuestions,
          // Mix in a few role-agnostic staples
          {
            en: 'Tell me about yourself and why this company.',
            ar: 'عرّف بنفسك ولماذا هذه الشركة.',
          },
          {
            en: 'Describe a time you owned a difficult outcome.',
            ar: 'صف مرة تولّيت فيها نتيجة صعبة.',
          },
          {
            en: 'What questions do you have for us?',
            ar: 'ما أسئلتك لنا؟',
          },
        ].slice(0, 7)
      : props.data.role.questions;

  const answerTips =
    kind === 'role'
      ? `${bi(locale, HOW_TO_ANSWER_GENERIC)} ${bi(locale, props.data.role.answerTips)}`
      : bi(locale, HOW_TO_ANSWER_GENERIC);

  const faqs =
    kind === 'company'
      ? companyGuideFaqs(props.data.company)
      : roleGuideFaqs(props.data.role);

  const jobsHref =
    kind === 'company' && props.data.listedCompanySlug
      ? `/companies/${props.data.listedCompanySlug}`
      : '/jobs';

  return (
    <div className="mq-atelier min-h-screen">
      <ArticleJsonLd
        title={title}
        description={description}
        url={pageUrl}
        image="/og-passport.jpg"
        datePublished={publishedAt}
        dateModified={publishedAt}
        locale={locale}
      />
      <BreadcrumbJsonLd
        items={[
          {
            name: isAr ? 'الرئيسية' : 'Home',
            url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL,
          },
          {
            name: isAr ? 'أدلة المقابلات' : 'Interview Guides',
            url: `${SITE_URL}${prefix}/interview-guide`,
          },
          { name: subjectName, url: pageUrl },
        ]}
      />
      <FaqJsonLd locale={locale} items={faqs} />

      <JobPortalChrome
        backHref="/interview-guide"
        backLabel={{ en: 'Interview Guides', ar: 'أدلة المقابلات' }}
      />

      <main className="mq-wrap py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <nav aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'} className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-white/45">
              <li>
                <Link href={localePath('/', locale)} className="hover:text-teal-200">
                  {isAr ? 'الرئيسية' : 'Home'}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={localePath('/interview-guide', locale)}
                  className="hover:text-teal-200"
                >
                  {isAr ? 'أدلة المقابلات' : 'Interview Guides'}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-white/70" aria-current="page">
                {subjectName}
              </li>
            </ol>
          </nav>

          <p className="mq-kicker mb-3">
            {kind === 'company'
              ? isAr
                ? 'دليل شركة'
                : 'Company guide'
              : isAr
                ? 'دليل دور'
                : 'Role guide'}
          </p>
          <h1 className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {isAr ? `دليل مقابلة ${subjectName}` : `${subjectName} Interview Guide`}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/60 md:text-lg">{hook}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={practiceHref}
              className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center justify-center gap-2 px-5 text-sm font-bold"
            >
              <Sparkles size={16} />
              {isAr
                ? `تدرّب على مقابلة ${subjectName} مع جيني`
                : `Practice ${subjectName} Interview with Jeannie`}
            </Link>
            <Link
              href={localePath(jobsHref, locale)}
              className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center justify-center gap-2 px-5 text-sm font-bold"
            >
              <Briefcase size={16} />
              {kind === 'company'
                ? isAr
                  ? `عرض وظائف ${subjectName}`
                  : `View all ${subjectName} jobs`
                : isAr
                  ? 'تصفّح الوظائف'
                  : 'Browse jobs'}
            </Link>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">
                {isAr ? 'صعوبة المقابلة' : 'Interview difficulty'}
              </p>
              <div className="mt-2">
                <Stars n={difficulty} />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">
                {isAr ? 'إشارة راتب' : 'Salary signal'}
              </p>
              <p className="mt-2 text-sm font-semibold text-white/80">{salaryHint}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">
                {isAr ? 'وظائف مفتوحة على مقابلة' : 'Open jobs on Muqabaleh'}
              </p>
              <p className="mt-2 text-sm font-semibold text-teal-200">{openJobs}</p>
            </div>
          </div>

          <div className="mt-12 space-y-10">
            <Section
              id="about"
              title={
                kind === 'company'
                  ? isAr
                    ? `عن ${subjectName}`
                    : `About ${subjectName}`
                  : isAr
                    ? `عن دور ${subjectName}`
                    : `About the ${subjectName} role`
              }
            >
              <p>{about}</p>
              {kind === 'company' ? (
                <p className="text-sm text-white/45">
                  {bi(locale, props.data.company.industry)} ·{' '}
                  {bi(locale, props.data.company.country)}
                </p>
              ) : null}
            </Section>

            <Section
              id="process"
              title={isAr ? 'عملية المقابلة' : 'Interview process'}
            >
              <ol className="list-decimal space-y-2 ps-5">
                {interviewProcessSteps(subjectName, locale).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Section>

            <Section
              id="questions"
              title={isAr ? 'أسئلة شائعة' : 'Common questions'}
            >
              <ul className="space-y-3">
                {questions.map((q) => (
                  <li
                    key={q.en}
                    className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white/80"
                  >
                    {bi(locale, q)}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="how-to-answer" title={isAr ? 'كيف تجيب' : 'How to answer'}>
              <p>{answerTips}</p>
            </Section>

            <Section
              id="culture"
              title={isAr ? 'اللباس ونصائح الثقافة' : 'What to wear / culture tips'}
            >
              <p>{culture}</p>
            </Section>

            <Section id="salary" title={isAr ? 'توقعات الراتب' : 'Salary expectations'}>
              <p>{salaryHint}</p>
              <p className="text-sm text-white/40">{bi(locale, SALARY_DISCLAIMER)}</p>
            </Section>

            {relatedJobs.length > 0 ? (
              <Section id="jobs" title={isAr ? 'وظائف ذات صلة' : 'Related jobs'}>
                <ul className="grid gap-3">
                  {relatedJobs.map((job) => (
                    <li key={job.id}>
                      <Link
                        href={localePath(
                          `/companies/${job.companySlug}/${job.slug}`,
                          locale,
                        )}
                        className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-teal-300/30"
                      >
                        <span className="text-xs font-semibold text-teal-300/80">
                          {job.companyName}
                        </span>
                        <span className="mt-1 font-bold text-white group-hover:text-teal-100">
                          {job.title}
                        </span>
                        <span className="mt-1 inline-flex items-center gap-1 text-sm text-white/45">
                          <MapPin size={13} aria-hidden />
                          {job.location}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            <Section id="related" title={isAr ? 'أدلة ذات صلة' : 'Related guides'}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {props.data.relatedCompanies.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={localePath(`/interview-guide/${c.slug}`, locale)}
                      className="block rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 hover:border-teal-300/30 hover:text-teal-100"
                    >
                      {isAr
                        ? `دليل مقابلة ${c.name.ar}`
                        : `${c.name.en} interview guide`}
                    </Link>
                  </li>
                ))}
                {props.data.relatedRoles.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={localePath(`/interview-guide/role/${r.slug}`, locale)}
                      className="block rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 hover:border-teal-300/30 hover:text-teal-100"
                    >
                      {isAr
                        ? `دليل مقابلة ${r.name.ar}`
                        : `${r.name.en} interview guide`}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="faq" title={isAr ? 'أسئلة متكررة' : 'FAQ'}>
              <dl className="space-y-4">
                {faqs.map((item) => (
                  <div key={item.q.en}>
                    <dt className="font-semibold text-white">{bi(locale, item.q)}</dt>
                    <dd className="mt-1 text-white/60">{bi(locale, item.a)}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          </div>
        </div>
      </main>
      <CrystalFooter />
    </div>
  );
}
