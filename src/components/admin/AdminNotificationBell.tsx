'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Bell, Mail } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BiInline } from '@/components/admin/BiLabel';
import { cn } from '@/lib/utils';

type Alert = {
  id: string;
  kind: string;
  severity: 'info' | 'warn' | 'critical';
  title: string;
  body: string;
  href: string;
  createdAt: string;
  unread: boolean;
};

function isStudent100(kind: string) {
  return kind === 'student100';
}

export function AdminNotificationBell({ className }: { className?: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unread, setUnread] = useState(0);
  const [emailDue, setEmailDue] = useState(0);
  const student100Unread = alerts.some((a) => isStudent100(a.kind) && a.unread);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/alerts');
      if (!res.ok) return;
      const data = await res.json();
      setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
      setUnread(Number(data.unreadCount || 0));
      setEmailDue(Number(data.counts?.pendingQueue || 0) + Number(data.counts?.failedQueue || 0));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const markAllRead = async () => {
    await fetch('/api/admin/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readAll: true }),
    });
    await load();
  };

  return (
    <div ref={rootRef} className={cn('relative z-50', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition',
          unread > 0
            ? student100Unread
              ? 'border-amber-400/70 bg-amber-500/20 text-amber-50 hover:bg-amber-500/30'
              : 'border-rose-400/60 bg-rose-500/20 text-white hover:bg-rose-500/30'
            : 'border-white/20 bg-white/[0.08] text-white hover:border-teal-300/40 hover:bg-white/[0.12]',
        )}
        aria-label={isAr ? 'التنبيهات وبريد النظام' : 'Alerts & system email'}
        title={isAr ? 'التنبيهات وبريد النظام' : 'Alerts & system email'}
      >
        <Bell size={18} className={student100Unread ? 'text-amber-200' : 'text-teal-200'} />
        <span className="hidden sm:inline">{isAr ? 'التنبيهات' : 'Alerts'}</span>
        {emailDue > 0 ? <Mail size={15} className="hidden text-white/70 sm:inline" /> : null}
        {unread > 0 ? (
          <span
            className={cn(
              'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white',
              student100Unread ? 'bg-amber-500' : 'bg-rose-500',
            )}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        ) : (
          <span className="hidden text-[11px] font-medium text-white/45 sm:inline">
            {isAr ? 'لا جديد' : 'Clear'}
          </span>
        )}
      </button>

      {open ? (
        <div
          className="absolute end-0 top-full z-[80] mt-2 w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-white/15 bg-[#0b1220] shadow-2xl"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
            <div className="text-sm font-medium text-white">
              <BiInline ar="التنبيهات وبريد النظام" en="Alerts & system email" />
            </div>
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-xs text-teal-300 hover:underline"
            >
              <BiInline ar="تعليم الكل كمقروء" en="Mark all read" />
            </button>
          </div>
          <ul className="max-h-[420px] overflow-y-auto">
            {alerts.slice(0, 20).map((a) => (
              <li key={a.id} className="border-b border-white/5 last:border-0">
                <Link
                  href={localePath(a.href, locale)}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block px-3 py-2.5 hover:bg-white/[0.04]',
                    isStudent100(a.kind) && 'border-s-2 border-amber-400 bg-amber-500/[0.08]',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        isStudent100(a.kind)
                          ? 'bg-amber-400'
                          : a.severity === 'critical'
                            ? 'bg-rose-400'
                            : a.severity === 'warn'
                              ? 'bg-amber-400'
                              : 'bg-teal-400',
                        !a.unread && 'opacity-30',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {isStudent100(a.kind) ? (
                          <span className="shrink-0 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200">
                            S100
                          </span>
                        ) : null}
                        <div className="truncate text-sm text-white">{a.title}</div>
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-white/50">{a.body}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wide text-white/35">
                        {isStudent100(a.kind) ? 'Student 100' : a.kind} ·{' '}
                        {new Date(a.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {!alerts.length ? (
              <li className="px-3 py-6 text-center text-sm text-white/45">
                <BiInline ar="لا تنبيهات حالياً" en="No alerts right now" />
              </li>
            ) : null}
          </ul>
          <div className="flex flex-wrap gap-2 border-t border-white/10 p-2">
            <Link
              href={localePath('/admin/campaigns/student100', locale)}
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-medium text-amber-200 hover:bg-amber-500/10"
            >
              <BiInline ar="مركز الطلاب 100" en="Student 100 inbox" />
            </Link>
            <Link
              href={localePath('/admin/content/email-queue', locale)}
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg px-2 py-1.5 text-center text-xs text-teal-300 hover:bg-white/5"
            >
              <BiInline ar="طابور البريد" en="Email queue" />
            </Link>
            <Link
              href={localePath('/admin/notifications', locale)}
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg px-2 py-1.5 text-center text-xs text-teal-300 hover:bg-white/5"
            >
              <BiInline ar="مركز التنبيهات" en="Notification center" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
