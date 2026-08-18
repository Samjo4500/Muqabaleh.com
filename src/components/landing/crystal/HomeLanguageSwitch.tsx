/** Server EN / عربي control for the homepage — no client hydration. */
export function HomeLanguageSwitch({ locale }: { locale: string }) {
  const href = locale === 'ar' ? '/en' : '/';
  const isAr = locale === 'ar';

  return (
    <div className="fixed top-4 right-4 z-[70]">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-[11px] font-bold tracking-wide text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-teal-300/40 hover:bg-white/12"
        aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <span className={isAr ? 'text-white/45' : 'text-teal-300'}>EN</span>
        <span className="text-white/35">/</span>
        <span className={isAr ? 'text-teal-300' : 'text-white/45'} dir="rtl" lang="ar">
          عربي
        </span>
      </a>
    </div>
  );
}
