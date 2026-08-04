'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { Badge } from '@/components/ui/badge';

const SESSIONS = [
  { id: 'chat-1', user: 'sara@example.com', status: 'Active', last: '2m ago', preview: 'هل يمكنني استرداد جلستي؟' },
  { id: 'chat-2', user: 'omar@company.sa', status: 'Active', last: '8m ago', preview: 'Need invoice for last month' },
  { id: 'chat-3', user: 'lina@mail.com', status: 'Archived', last: '1d ago', preview: 'Thanks for the help!' },
];

export default function Page() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'الدردشة المباشرة', en: 'Live Chat' }}
        description={{
          ar: 'الجلسات النشطة وأرشيف المحادثات.',
          en: 'Active chat sessions and chat history archive.',
        }}
      />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-3">
          <BiLabel ar="الجلسات" en="Sessions" size="sm" />
          <ul className="mt-3 space-y-2">
            {SESSIONS.map((s) => (
              <li key={s.id} className="cursor-pointer rounded-xl border border-white/5 p-3 hover:bg-white/5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{s.user}</span>
                  <Badge variant="outline">{s.status}</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{s.preview}</p>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">{s.last}</p>
              </li>
            ))}
          </ul>
        </aside>
        <section className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="نافذة المحادثة" en="Chat window" />
          <div className="mt-4 flex-1 space-y-3 text-sm">
            <div className="max-w-[80%] rounded-2xl bg-white/5 px-3 py-2">هل يمكنني استرداد جلستي؟</div>
            <div className="ms-auto max-w-[80%] rounded-2xl bg-cyan-500/20 px-3 py-2">
              بالطبع — أرسل رقم الجلسة وسنراجعها خلال دقائق.
            </div>
          </div>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            <BiInline ar="الأرشيف متاح من القائمة الجانبية." en="Archive available from the session list." />
          </p>
        </section>
      </div>
    </div>
  );
}
