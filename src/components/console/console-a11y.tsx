'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
  Accessibility,
  Check,
  Keyboard,
  Search,
  X,
} from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import {
  type ConsoleA11yPrefs,
  type FontScale,
  DEFAULT_A11Y_PREFS,
  FONT_SCALE_FACTOR,
  readA11yPrefs,
  writeA11yPrefs,
} from '@/lib/console/a11y';
import { cn } from '@/lib/utils';

type A11yCtx = ConsoleA11yPrefs & {
  setFontScale: (v: FontScale) => void;
  setReaderFont: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setSimpleMode: (v: boolean) => void;
  announce: (message: string) => void;
  effectiveReduceMotion: boolean;
};

const Ctx = createContext<A11yCtx | null>(null);

export function useConsoleA11y() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      ...DEFAULT_A11Y_PREFS,
      setFontScale: () => {},
      setReaderFont: () => {},
      setReduceMotion: () => {},
      setSimpleMode: () => {},
      announce: () => {},
      effectiveReduceMotion: false,
    } satisfies A11yCtx;
  }
  return ctx;
}

function systemPrefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ConsoleA11yProvider({
  tenantSlug,
  children,
}: {
  tenantSlug: string;
  children: ReactNode;
}) {
  const [prefs, setPrefs] = useState<ConsoleA11yPrefs>(DEFAULT_A11Y_PREFS);
  const [systemReduce, setSystemReduce] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrefs(readA11yPrefs());
    setSystemReduce(systemPrefersReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setSystemReduce(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const patch = useCallback((partial: Partial<ConsoleA11yPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      writeA11yPrefs(next);
      return next;
    });
  }, []);

  const effectiveReduceMotion = prefs.reduceMotion || systemReduce;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-scale', String(FONT_SCALE_FACTOR[prefs.fontScale]));
    root.dataset.consoleFont = prefs.fontScale;
    root.dataset.consoleReader = prefs.readerFont ? '1' : '0';
    root.dataset.consoleReduceMotion = effectiveReduceMotion ? '1' : '0';
    root.dataset.consoleSimple = prefs.simpleMode ? '1' : '0';
  }, [prefs, effectiveReduceMotion]);

  const announce = useCallback((message: string) => {
    setAnnouncement('');
    window.setTimeout(() => setAnnouncement(message), 30);
  }, []);

  const value = useMemo<A11yCtx>(
    () => ({
      ...prefs,
      setFontScale: (fontScale) => patch({ fontScale }),
      setReaderFont: (readerFont) => patch({ readerFont }),
      setReduceMotion: (reduceMotion) => patch({ reduceMotion }),
      setSimpleMode: (simpleMode) => patch({ simpleMode }),
      announce,
      effectiveReduceMotion,
    }),
    [prefs, patch, announce, effectiveReduceMotion],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        ref={liveRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {announcement}
      </div>
      <ConsoleKeyboardLayer tenantSlug={tenantSlug} announce={announce} />
    </Ctx.Provider>
  );
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

function ConsoleKeyboardLayer({
  tenantSlug,
  announce,
}: {
  tenantSlug: string;
  announce: (m: string) => void;
}) {
  const t = useTranslations('console.a11y');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const pathname = usePathname();
  const [cheatOpen, setCheatOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  const rows = () =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-passport-row]'));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (cheatOpen) {
          e.preventDefault();
          setCheatOpen(false);
          return;
        }
        const open = document.querySelector<HTMLElement>('[data-console-modal="true"]');
        if (open) {
          open.dispatchEvent(new CustomEvent('console-escape', { bubbles: true }));
        }
        return;
      }

      // Always allow cheat-sheet, even when search/input is focused.
      if (e.key === '?' || (e.shiftKey && (e.key === '/' || e.code === 'Slash'))) {
        e.preventDefault();
        (document.activeElement as HTMLElement | null)?.blur?.();
        setCheatOpen((v) => !v);
        return;
      }

      if (isTypingTarget(e.target)) return;

      if (e.key === '/') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-console-search]')?.focus();
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        router.push(localePath(`/console/${tenantSlug}/jobs/new`, locale));
        return;
      }

      const list = rows();
      if (!list.length) return;

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setSelected((i) => {
          const next = Math.min(list.length - 1, i + 1);
          list[next]?.focus();
          list[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
      }
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setSelected((i) => {
          const next = Math.max(0, i - 1);
          list[next]?.focus();
          list[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
      }
      if (e.key === 'Home') {
        e.preventDefault();
        setSelected(0);
        list[0]?.focus();
      }
      if (e.key === 'End') {
        e.preventDefault();
        setSelected(list.length - 1);
        list[list.length - 1]?.focus();
      }
      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        const row = list[selected] || list[0];
        const href = row?.getAttribute('data-passport-href');
        if (href) router.push(href);
      }
      if (e.key === 's' || e.key === 'S' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        const row = list[selected] || list[0];
        const id = row?.getAttribute('data-passport-id');
        const name = row?.getAttribute('data-passport-name') || '';
        if (!id) return;
        const stageKey = e.key.toLowerCase() === 's' ? 'SHORTLISTED' : 'REJECTED';
        void fetch(`/api/console/${tenantSlug}/pipeline/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stageKey }),
        }).then(() => {
          const stageLabel =
            stageKey === 'SHORTLISTED' ? t('stageShortlisted') : t('stageRejected');
          announce(t('announceMoved', { name, stage: stageLabel }));
          row?.setAttribute('data-passport-stage', stageKey);
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [announce, cheatOpen, locale, router, selected, t, tenantSlug, pathname]);

  useEffect(() => {
    if (!cheatOpen) return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !focusables.length) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    root.addEventListener('keydown', trap);
    return () => root.removeEventListener('keydown', trap);
  }, [cheatOpen]);

  if (!cheatOpen) return null;

  const shortcuts = [
    { key: '?', action: t('shortcutHelp') },
    { key: 'J', action: t('shortcutNext') },
    { key: 'K', action: t('shortcutPrev') },
    { key: 'S', action: t('shortcutShortlist') },
    { key: 'R', action: t('shortcutReject') },
    { key: 'O', action: t('shortcutOpen') },
    { key: 'N', action: t('shortcutNewJob') },
    { key: '/', action: t('shortcutSearch') },
    { key: 'Esc', action: t('shortcutEsc') },
  ];

  return (
    <div
      className="fixed inset-0 z-[97] flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onClick={() => setCheatOpen(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mq-shortcuts-title"
        aria-describedby="mq-shortcuts-desc"
        data-console-modal="true"
        className="mq-console-surface w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mq-console-eyebrow inline-flex items-center gap-1.5">
              <Keyboard size={12} aria-hidden />
              {t('shortcutsEyebrow')}
            </p>
            <h2 id="mq-shortcuts-title" className="mt-1 text-lg font-medium text-[var(--c-text)]">
              {t('shortcutsTitle')}
            </h2>
            <p id="mq-shortcuts-desc" className="mt-1 text-sm text-[var(--c-text-2)]">
              {t('shortcutsBody')}
            </p>
          </div>
          <button
            type="button"
            className="mq-console-icon-btn"
            aria-label={t('close')}
            onClick={() => setCheatOpen(false)}
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {shortcuts.map((s) => (
            <li
              key={s.key}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--c-border)] px-3 py-2 text-sm"
            >
              <span className="text-[var(--c-text-2)]">{s.action}</span>
              <kbd className="rounded-md border border-[var(--c-border)] bg-[var(--c-surface-2)] px-2 py-0.5 font-mono text-[var(--c-text)]">
                {s.key}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ConsoleA11yMenu() {
  const t = useTranslations('console.a11y');
  const {
    fontScale,
    readerFont,
    reduceMotion,
    simpleMode,
    setFontScale,
    setReaderFont,
    setReduceMotion,
    setSimpleMode,
  } = useConsoleA11y();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // Use click (not mousedown) so the opening click cannot race-close the menu.
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const scales: FontScale[] = ['standard', 'large', 'xl'];

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="mq-console-icon-btn"
        data-console-a11y-menu
        aria-label={t('menuLabel')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <Accessibility size={15} strokeWidth={1.5} />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={t('menuLabel')}
          data-console-a11y-panel
          className="absolute end-0 z-50 mt-2 w-[min(288px,calc(100vw-2rem))] rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-solid)] p-3 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="px-1 text-xs font-medium text-[var(--c-text-2)]">{t('fontSize')}</p>
          <div className="mt-2 flex gap-1" role="group" aria-label={t('fontSize')}>
            {scales.map((s) => (
              <button
                key={s}
                type="button"
                role="menuitemradio"
                aria-checked={fontScale === s}
                className={cn(
                  'flex-1 rounded-lg border px-2 py-2 text-xs',
                  fontScale === s
                    ? 'border-[var(--c-primary)] bg-[var(--c-primary-soft)] text-[var(--c-primary)]'
                    : 'border-[var(--c-border)] text-[var(--c-text-2)]',
                )}
                onClick={() => setFontScale(s)}
              >
                {t(`font_${s}`)}
              </button>
            ))}
          </div>

          <ToggleRow
            label={t('readerFont')}
            checked={readerFont}
            onChange={setReaderFont}
          />
          <ToggleRow
            label={t('reduceMotion')}
            checked={reduceMotion}
            onChange={setReduceMotion}
          />
          <ToggleRow
            label={t('simpleMode')}
            checked={simpleMode}
            onChange={setSimpleMode}
          />
        </div>
      ) : null}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      className="mt-2 flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2 text-start text-sm text-[var(--c-text)] hover:bg-[var(--c-surface-2)]"
      onClick={() => onChange(!checked)}
    >
      <span>{label}</span>
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded border',
          checked
            ? 'border-[var(--c-primary)] bg-[var(--c-primary)] text-[#042f2e]'
            : 'border-[var(--c-border)]',
        )}
      >
        {checked ? <Check size={12} strokeWidth={2.5} aria-hidden /> : null}
      </span>
    </button>
  );
}

export function ConsoleSearchField() {
  const t = useTranslations('console.a11y');
  return (
    <label className="relative hidden items-center md:flex">
      <span className="sr-only">{t('searchLabel')}</span>
      <Search
        size={14}
        strokeWidth={1.5}
        className="pointer-events-none absolute start-2.5 text-[var(--c-text-3)]"
        aria-hidden
      />
      <input
        data-console-search
        type="search"
        className="mq-console-input w-44 ps-8 pe-2 text-xs"
        placeholder={t('searchPlaceholder')}
      />
    </label>
  );
}
