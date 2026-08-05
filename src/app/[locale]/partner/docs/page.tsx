'use client';

import { useTranslations } from 'next-intl';
import { PageHeader, Panel } from '@/components/partner/ui';

const ENDPOINTS = [
  { method: 'GET', path: '/api/partner/me', descKey: 'docMe' },
  { method: 'GET', path: '/api/partner/dashboard', descKey: 'docDashboard' },
  { method: 'GET/POST', path: '/api/partner/clients', descKey: 'docClients' },
  { method: 'PATCH', path: '/api/partner/branding', descKey: 'docBranding' },
  { method: 'GET/POST', path: '/api/partner/api-keys', descKey: 'docKeys' },
  { method: 'GET/POST', path: '/api/partner/webhooks', descKey: 'docWebhooks' },
  { method: 'GET', path: '/api/partner/analytics', descKey: 'docAnalytics' },
  { method: 'GET', path: '/api/partner/resolve?host=', descKey: 'docResolve' },
];

export default function PartnerDocsPage() {
  const t = useTranslations('partnerConsole');

  return (
    <div>
      <PageHeader eyebrow={t('navDocs')} title={t('docsTitle')} description={t('docsDesc')} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={t('quickStart')}>
          <ol className="list-decimal space-y-3 ps-5 text-sm text-white/70">
            <li>{t('qs1')}</li>
            <li>{t('qs2')}</li>
            <li>{t('qs3')}</li>
            <li>{t('qs4')}</li>
          </ol>
        </Panel>
        <Panel title={t('webhookEvents')}>
          <ul className="space-y-2 text-sm text-white/70">
            {['interview.completed', 'candidate.scored', 'job.created', 'invite.sent', 'credits.low'].map(
              (ev) => (
                <li key={ev} className="rounded-lg bg-white/[0.03] px-3 py-2 font-mono text-xs">
                  {ev}
                </li>
              ),
            )}
          </ul>
        </Panel>
      </div>

      <Panel title={t('apiReference')} className="mt-5">
        <div className="space-y-3">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[var(--pc-primary)]/20 px-2 py-0.5 text-[11px] font-bold text-[var(--pc-primary)]">
                  {ep.method}
                </span>
                <code className="text-sm text-white/85">{ep.path}</code>
              </div>
              <p className="mt-1 text-xs text-white/45">{t(ep.descKey as 'docMe')}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
