'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Sparkles, X } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import {
  type ChecklistItemId,
  type ChecklistState,
  readChecklist,
  writeChecklist,
} from '@/lib/console/onboarding';
import { cn } from '@/lib/utils';

type Facts = {
  hasLogo: boolean;
  hasJob: boolean;
  hasInvite: boolean;
  hasPassport: boolean;
  hasQuestions: boolean;
};

const ITEMS: {
  id: ChecklistItemId;
  href: (slug: string) => string;
}[] = [
  { id: 'logo', href: (s) => `/console/${s}/settings` },
  { id: 'job', href: (s) => `/console/${s}/jobs/new` },
  { id: 'invite', href: (s) => `/console/${s}/team` },
  { id: 'passport', href: (s) => `/console/${s}/passports` },
  { id: 'questions', href: (s) => `/console/${s}/jobs/new` },
];

type Props = {
  tenantSlug: string;
  facts: Facts;
};

export function SetupChecklist({ tenantSlug, facts }: Props) {
  const t = useTranslations('console.onboarding');
  const locale = useLocale();
  const [manual, setManual] = useState<ChecklistState>({});
  const [dismissed, setDismissed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    setManual(readChecklist(tenantSlug));
    try {
      setDismissed(
        localStorage.getItem(`mq-console-checklist-dismiss:${tenantSlug}`) === '1',
      );
    } catch {
      /* ignore */
    }
  }, [tenantSlug]);

  const auto: ChecklistState = useMemo(
    () => ({
      logo: facts.hasLogo,
      job: facts.hasJob,
      invite: facts.hasInvite,
      passport: facts.hasPassport,
      questions: facts.hasQuestions || manual.questions,
    }),
    [facts, manual.questions],
  );

  const merged = useMemo(() => {
    const out: ChecklistState = {};
    for (const item of ITEMS) {
      out[item.id] = Boolean(auto[item.id] || manual[item.id]);
    }
    return out;
  }, [auto, manual]);

  const doneCount = ITEMS.filter((i) => merged[i.id]).length;
  const allDone = doneCount === ITEMS.length;

  useEffect(() => {
    if (allDone && !dismissed) {
      setCelebrate(true);
      const tmr = window.setTimeout(() => setCelebrate(false), 2400);
      return () => window.clearTimeout(tmr);
    }
  }, [allDone, dismissed]);

  if (dismissed) return null;

  const toggle = (id: ChecklistItemId) => {
    const next = { ...manual, [id]: !merged[id] };
    setManual(next);
    writeChecklist(tenantSlug, next);
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(`mq-console-checklist-dismiss:${tenantSlug}`, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      className="mq-console-surface sticky top-2 z-20 mb-6 overflow-hidden p-4 md:p-5"
      data-tour="setup-checklist"
    >
      {celebrate ? (
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-[var(--c-primary)]/10" />
      ) : null}
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mq-console-eyebrow inline-flex items-center gap-1.5">
            <Sparkles size={12} strokeWidth={1.5} />
            {t('checklistTitle')}
          </p>
          <p className="mt-1 text-sm text-[var(--c-text-2)]">
            {t('checklistProgress', { done: doneCount, total: ITEMS.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="mq-console-icon-btn"
          aria-label={t('dismiss')}
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-[var(--c-surface-2)]">
        <div
          className="h-full rounded-full bg-[var(--c-primary)] transition-all duration-500"
          style={{ width: `${(doneCount / ITEMS.length) * 100}%` }}
        />
      </div>

      <ul className="relative mt-4 space-y-2">
        {ITEMS.map((item) => {
          const done = Boolean(merged[item.id]);
          return (
            <li key={item.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors',
                  done
                    ? 'border-[var(--c-primary)] bg-[var(--c-primary)] text-[#042f2e]'
                    : 'border-[var(--c-border)] bg-[var(--c-surface-2)] text-transparent',
                )}
                aria-pressed={done}
                aria-label={t(`check_${item.id}`)}
              >
                <Check size={14} strokeWidth={2} />
              </button>
              <Link
                href={localePath(item.href(tenantSlug), locale)}
                className={cn(
                  'text-sm transition-colors hover:text-[var(--c-primary)]',
                  done
                    ? 'text-[var(--c-text-3)] line-through'
                    : 'text-[var(--c-text)]',
                )}
              >
                {t(`check_${item.id}`)}
              </Link>
            </li>
          );
        })}
      </ul>

      {allDone ? (
        <p className="relative mt-4 text-sm font-medium text-[var(--c-primary)]">
          {t('checklistDone')}
        </p>
      ) : null}
    </section>
  );
}
