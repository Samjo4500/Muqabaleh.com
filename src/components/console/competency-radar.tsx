'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useLocale } from 'next-intl';

export function CompetencyRadar({
  data,
}: {
  data: { axis: string; axisAr: string; score: number; benchmark: number }[];
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const rows = data.map((d) => ({
    subject: isAr ? d.axisAr : d.axis,
    score: d.score,
    benchmark: d.benchmark,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={rows} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--c-border)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--c-text-2)', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={isAr ? 'المعيار' : 'Benchmark'}
            dataKey="benchmark"
            stroke="#94A3B8"
            fill="#94A3B8"
            fillOpacity={0.15}
          />
          <Radar
            name={isAr ? 'المرشح' : 'Candidate'}
            dataKey="score"
            stroke="#14B8A6"
            fill="#14B8A6"
            fillOpacity={0.35}
          />
          <Legend wrapperStyle={{ color: 'var(--c-text-2)', fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
