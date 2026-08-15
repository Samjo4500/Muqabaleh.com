import { loadSocialProofStats } from '@/lib/social-proof';

function formatCount(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 100) / 10}k+`;
  return `${n}+`;
}

export async function CrystalSocialProof({ locale }: { locale: string }) {
  const stats = await loadSocialProofStats();
  if (!stats) return null;
  const isAr = locale !== 'en';

  const items = [
    stats.interviews
      ? {
          value: formatCount(stats.interviews),
          label: isAr ? 'مقابلة تجريبية أُجريت' : 'mock interviews practiced',
        }
      : null,
    stats.companies
      ? {
          value: formatCount(stats.companies),
          label: isAr ? 'شركة مغطاة' : 'companies covered',
        }
      : null,
    stats.guides
      ? {
          value: formatCount(stats.guides),
          label: isAr ? 'دليل مقابلة متاح' : 'interview guides available',
        }
      : null,
  ].filter(Boolean) as Array<{ value: string; label: string }>;

  if (!items.length) return null;

  return (
    <section className="mq-section border-t border-white/10 py-12" aria-label={isAr ? 'أرقام المنصة' : 'Platform stats'}>
      <div className="mq-wrap">
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 text-center"
            >
              <p className="mq-display text-3xl font-bold text-teal-200 md:text-4xl">{item.value}</p>
              <p className="mt-2 text-sm text-white/55">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
