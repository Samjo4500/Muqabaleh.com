import { setRequestLocale } from 'next-intl/server';
import { JeannieWorkspaceClient } from './jeannie-workspace-client';

type Props = { params: Promise<{ locale: string }> };

export default async function JeannieWorkspacePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JeannieWorkspaceClient />;
}
