'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Globe } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { getLocaleSwitchPath } from '@/i18n/navigation';

const NAV_LINKS = [
  { key: 'why', href: '#why' },
  { key: 'how', href: '#how' },
  { key: 'interviewers', href: '#interviewers' },
  { key: 'pricing', href: '#pricing' },
  { key: 'business', href: '/business' },
  { key: 'faq', href: '#faq' },
] as const;

export function Navbar() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLocale = () => {
    const next = locale === 'ar' ? 'en' : 'ar';
    const newPath = getLocaleSwitchPath(pathname, locale, next);
    window.location.href = newPath;
  };

  const localeLabel = locale === 'ar' ? 'EN' : 'AR';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/5 bg-[var(--bg-panel)]/80 backdrop-blur-lg'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — RTL: right, LTR: left */}
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logos/v2-balanced-a-T.webp"
            alt="مقابلة | Muqabaleh"
            width={200}
            height={56}
            className="h-14 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav links — center */}
        <div className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              {t(link.key)}
            </Link>
          ))}
        </div>

        {/* Right side — RTL: left, LTR: right */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={switchLocale}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-[var(--text-muted)] transition-colors hover:border-white/20 hover:text-[var(--text-primary)]"
            aria-label={localeLabel}
          >
            <Globe size={16} strokeWidth={1.75} />
            {localeLabel}
          </button>
          <Link href="/auth/signin" className="btn-ghost text-sm">
            {tc('login')}
          </Link>
          <Link href="/auth/register" className="btn-gold text-sm">
            {tc('startFree')}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex items-center justify-center rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] lg:hidden"
              aria-label="Menu"
            >
              <Menu size={20} strokeWidth={1.75} />
            </button>
          </SheetTrigger>
          <SheetContent
            side={locale === 'ar' ? 'left' : 'right'}
            className="w-72 border-white/10 bg-[var(--bg-panel)]"
          >
            <SheetHeader>
              <SheetTitle className="ms-2 text-left text-[var(--text-primary)]">
                مقابلة | Muqabaleh
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
                >
                  {t(link.key)}
                </Link>
              ))}
              <hr className="my-2 border-white/10" />
              <button
                onClick={() => {
                  switchLocale();
                  setOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
              >
                <Globe size={16} strokeWidth={1.75} />
                {localeLabel}
              </button>
              <Link
                href="/auth/signin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
              >
                {tc('login')}
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setOpen(false)}
                className="btn-gold mt-2 text-center text-sm"
              >
                {tc('startFree')}
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
