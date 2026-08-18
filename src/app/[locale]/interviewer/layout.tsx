import { FullMessages } from '@/components/i18n/FullMessages';
import { InterviewerChrome } from './interviewer-chrome';

export default function InterviewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <FullMessages>
      <InterviewerChrome>{children}</InterviewerChrome>
    </FullMessages>
  );
}
