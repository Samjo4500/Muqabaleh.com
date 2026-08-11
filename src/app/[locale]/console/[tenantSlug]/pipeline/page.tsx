'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PipelineBoard } from '@/components/console/pipeline-board';

export default function ConsolePipelinePage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-[var(--c-text)]">{t('pipelineTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('pipelineHint')}</p>
      </div>
      <PipelineBoard tenantSlug={tenantSlug} />
    </div>
  );
}
