'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiLabel } from '@/components/admin/BiLabel';

const FUNNEL = [
  { step: 'Visit / زيارة', value: 100 },
  { step: 'Signup / تسجيل', value: 42 },
  { step: 'Start Interview / بدء مقابلة', value: 28 },
  { step: 'Complete Interview / إكمال', value: 19 },
  { step: 'Subscribe / اشتراك', value: 7 },
];

export default function Page() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'تحليلات سلوك المستخدمين', en: 'User Behavior' }}
        description={{
          ar: 'مسار التحويل، نقاط التسرب، ومساحة لخرائط الحرارة.',
          en: 'Funnel Visit→Signup→Interview→Complete→Subscribe, drop-offs, heatmap placeholder.',
        }}
      />
      <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
        <BiLabel ar="مسار التحويل" en="Conversion funnel" />
        <div className="mt-6 space-y-3">
          {FUNNEL.map((f) => (
            <div key={f.step}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{f.step}</span>
                <span className="text-cyan-300">{f.value}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-400/80" style={{ width: `${f.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-4 rounded-2xl border border-dashed border-white/15 bg-[var(--bg-panel)] p-8 text-center text-sm text-[var(--text-muted)]">
        Heatmap integration placeholder / مساحة تكامل خرائط الحرارة
      </section>
    </div>
  );
}
