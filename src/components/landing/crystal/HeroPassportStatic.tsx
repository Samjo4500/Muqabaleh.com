const COMPETENCIES = [
  { en: 'Communication', ar: 'التواصل', score: 90 },
  { en: 'Technical Depth', ar: 'العمق التقني', score: 84 },
  { en: 'Problem Solving', ar: 'حل المشكلات', score: 88 },
  { en: 'Cultural Fit', ar: 'الملاءمة الثقافية', score: 86 },
  { en: 'Confidence', ar: 'الثقة', score: 82 },
] as const;

type Props = {
  locale: string;
  cityEn: string;
  cityAr: string;
  score?: number;
  grade?: string;
  compact?: boolean;
};

/** Server-safe passport card — no framer-motion on the LCP path. */
export function HeroPassportStatic({
  locale,
  cityEn,
  cityAr,
  score = 86,
  grade = 'A',
  compact = false,
}: Props) {
  const isAr = locale === 'ar';
  const city = isAr ? cityAr : cityEn;

  return (
    <div
      className="mq-hero-passport pointer-events-none select-none"
      dir={isAr ? 'rtl' : 'ltr'}
      aria-label={
        isAr
          ? `معاينة جواز المقابلة — النتيجة ${score}`
          : `Interview passport preview — score ${score}`
      }
    >
      <div className="relative overflow-visible rounded-2xl border border-teal-300/35 bg-[#070b14]/88 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-80"
          style={{
            background:
              'radial-gradient(circle at 12% 0%, rgba(45,212,191,0.28), transparent 42%), linear-gradient(165deg, rgba(14,28,42,0.4), transparent 55%)',
          }}
          aria-hidden
        />
        <div className={`relative ${compact ? 'p-3.5' : 'p-4 md:p-5'}`}>
          <div className={`flex items-start justify-between gap-2 ${compact ? 'mb-2.5' : 'mb-3'}`}>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300/85">
                {isAr ? 'جواز مقابلتك' : 'Your Interview Passport'}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-white">
                {isAr ? 'المتقدم: اسمك' : 'Applicant: Your name'}
              </p>
              <p className="mt-0.5 text-[11px] text-white/50">
                {isAr ? `جاهز للتوظيف · ${city}` : `Hire-ready · ${city}`}
              </p>
            </div>
            <span className="shrink-0 rounded-md border border-teal-300/35 bg-teal-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-100">
              {isAr ? 'موثّق' : 'Verified'}
            </span>
          </div>

          <div className={`flex items-end gap-2 ${compact ? 'mb-2.5' : 'mb-3'}`}>
            <span
              className={`mq-display font-black leading-none text-teal-300 ${
                compact ? 'text-3xl' : 'text-4xl md:text-5xl'
              }`}
            >
              {score}
            </span>
            <span className="pb-0.5 text-lg font-bold text-white/70">{grade}</span>
            <span className="pb-1 text-[11px] text-white/40">/100</span>
          </div>

          <ul className={`mb-2.5 ${compact ? 'space-y-1.5' : 'space-y-2 mb-3.5'}`}>
            {COMPETENCIES.map((c) => (
              <li key={c.en}>
                <div
                  className={`mb-0.5 flex items-center justify-between text-white/65 ${
                    compact ? 'text-[10px]' : 'text-[11px]'
                  }`}
                >
                  <span>{isAr ? c.ar : c.en}</span>
                  <span className="font-semibold text-white/80">{c.score}</span>
                </div>
                <div className={`overflow-hidden rounded-full bg-white/10 ${compact ? 'h-1' : 'h-1.5'}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300"
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div
            className={`grid grid-cols-2 gap-2 leading-snug text-white/60 ${
              compact ? 'mb-2.5 text-[9px]' : 'mb-3.5 text-[10px]'
            }`}
          >
            <div>
              <p className="mb-0.5 font-bold text-white/45">
                {isAr ? 'نقاط القوة' : 'Strengths'}
              </p>
              <ul className="space-y-0.5">
                <li>• {isAr ? 'إجابات منظمة' : 'Clear structure'}</li>
                <li>• {isAr ? 'أمثلة قوية' : 'Strong examples'}</li>
              </ul>
            </div>
            <div>
              <p className="mb-0.5 font-bold text-white/45">
                {isAr ? 'للتحسين' : 'Improvements'}
              </p>
              <ul className="space-y-0.5">
                <li>• {isAr ? 'أضف أرقاماً' : 'Add metrics'}</li>
                <li>• {isAr ? 'عمّق التفاصيل' : 'Deeper detail'}</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 pt-2.5">
            <div
              className={`mq-qr-placeholder relative shrink-0 overflow-hidden rounded-lg border border-white/15 ${
                compact ? 'h-12 w-12' : 'h-14 w-14'
              }`}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white/80">
                {isAr ? 'امسح للتحقق' : 'Scan to verify'}
              </p>
              <p className="truncate font-mono text-[10px] text-teal-200/70">MQB-DEMO</p>
              <p className="mt-0.5 text-[10px] text-white/40">
                {isAr ? 'يظهر اسمك بعد المقابلة' : 'Your name appears after the interview'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
