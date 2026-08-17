import Image from 'next/image';
import Link from 'next/link';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { localePath } from '@/i18n/navigation';

const JEANNIE_SRC = '/images/hero-interview.webp';
const PROFILE_PDF = '/muqabaleh-company-profile.pdf';

export function CompanyProfileView({ locale }: { locale: string }) {
  const isAr = locale !== 'en';

  return (
    <div className="mq-atelier min-h-screen">
      <JobPortalChrome
        backHref="/"
        backLabel={{ en: 'Home', ar: 'الرئيسية' }}
      />

      <section className="relative overflow-hidden border-b border-white/10">
        <Image
          src={JEANNIE_SRC}
          alt={isAr ? 'جيني — مدربة المقابلات في مقابلة' : 'Jeannie — Muqabaleh interview coach'}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_20%] opacity-40"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-[#05080f]/85 to-[#05080f]/55"
          aria-hidden
        />
        <div className="mq-wrap relative pb-10 pt-28 md:pb-12 md:pt-32">
          <BrandLogo
            size="hero"
            priority
            className="mb-6 drop-shadow-[0_12px_40px_rgba(45,212,191,0.35)]"
          />
          <p className="mq-kicker mb-3 text-teal-200/90">
            {isAr ? 'ملف الشركة · للعرض فقط' : 'Company profile · View only'}
          </p>
          <h1 className="mq-display max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
            {isAr ? 'ملف شركة مقابلة' : 'Muqabaleh company profile'}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
            {isAr
              ? 'اطّلع على الملف التعريفي في المتصفح. هذا المستند للعرض فقط وليس للتحميل.'
              : 'Read the company profile in your browser. This document is view-only and is not offered as a download.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={localePath('/request-demo', locale)}
              className="mq-btn mq-btn-primary min-h-12 px-6 text-sm font-bold"
            >
              {isAr ? 'اطلب عرضاً' : 'Request a demo'}
            </Link>
            <Link
              href={localePath('/business', locale)}
              className="mq-btn mq-btn-ghost min-h-12 px-6 text-sm font-bold"
            >
              {isAr ? 'للشركات' : 'For companies'}
            </Link>
          </div>
        </div>
      </section>

      <section className="mq-section pt-8 md:pt-10" aria-labelledby="company-profile-doc">
        <div className="mq-wrap">
          <h2 id="company-profile-doc" className="sr-only">
            {isAr ? 'ملف الشركة' : 'Company profile document'}
          </h2>
          <div className="overflow-hidden rounded-sm border border-white/15 bg-[#0b1220] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <iframe
              title={isAr ? 'ملف شركة مقابلة' : 'Muqabaleh company profile'}
              src={`${PROFILE_PDF}#toolbar=0&navpanes=0&scrollbar=1`}
              className="h-[min(85vh,1100px)] w-full bg-white"
            />
          </div>
          <p className="mt-4 text-center text-sm text-white/40">
            {isAr
              ? 'للشراكات: '
              : 'Partnerships: '}
            <a href="mailto:info@muqabaleh.com" className="text-teal-300 hover:text-teal-200">
              info@muqabaleh.com
            </a>
          </p>
        </div>
      </section>

      <CrystalFooter />
    </div>
  );
}
