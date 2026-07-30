'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Speaker, VolumeX, Mic, Send, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InterviewAvatar, LiveBadge } from '@/components/brand';

const TOTAL_QUESTIONS = 8;
const CURRENT_QUESTION = 3;

export default function InterviewRoomPage() {
  const t = useTranslations('app.room');
  const tCommon = useTranslations('common');

  const [seconds, setSeconds] = useState(342);
  const [message, setMessage] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [showReportLink, setShowReportLink] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, []);

  const handleComplete = () => {
    setShowComplete(true);
    setProgressPct(0);
    const interval = setInterval(() => {
      setProgressPct((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setShowReportLink(true);
          return 100;
        }
        return p + 1;
      });
    }, 30);
  };

  const messages = [
    { role: 'interviewer' as const, text: t('q1') },
    { role: 'candidate' as const, text: t('a1') },
    { role: 'interviewer' as const, text: t('q2') },
    { role: 'candidate' as const, text: t('a2') },
    { role: 'interviewer' as const, text: t('q3') },
    { role: 'candidate' as const, text: '', typing: true },
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:h-screen lg:pt-0">
      {/* Completion overlay */}
      {showComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-void)]/90 backdrop-blur-sm">
          <div className="mx-4 max-w-sm text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald bg-emerald/10">
              <span className="text-3xl font-bold text-emerald">100%</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">
              {t('interviewComplete')}
            </h2>
            <div className="mb-6 flex justify-center">
              <LiveBadge />
            </div>
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              {t('generatingReport')}
            </p>
            <div className="mx-auto mb-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gold transition-all duration-100"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {showReportLink && (
              <Link href="/app/interview/1/report">
                <Button className="btn-gold cursor-pointer">
                  {t('viewReport')}
                  <ChevronRight size={16} strokeWidth={1.75} className="ms-1 inline" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.08] bg-[var(--bg-panel)]/80 px-4 py-3 backdrop-blur-md">
        <InterviewAvatar who="fahd" size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {'\u0641\u0647\u062F'}
          </span>
          <span className="text-xs text-emerald">{t('connected')}</span>
        </div>
        <div className="ms-auto flex items-center gap-3">
          <LiveBadge className="border-red-500/30 bg-red-500/10 [&>span]:text-red-400 [&_.animate-pulse-emerald]:animate-pulse [&_.animate-pulse-emerald]:!bg-red-500 [&>span:first-child>span:first-child]:!bg-red-500 [&>span:first-child>span:last-child]:!bg-red-500" />
          <span className="font-mono text-sm font-medium text-[var(--text-muted)]">
            {formatTime(seconds)}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
            {t('questionOf', { current: CURRENT_QUESTION, total: TOTAL_QUESTIONS })}
          </span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg, i) => {
            const isInterviewer = msg.role === 'interviewer';
            return (
              <div
                key={i}
                className={`flex gap-3 ${isInterviewer ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {isInterviewer && <InterviewAvatar who="fahd" size="sm" />}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isInterviewer
                      ? 'border border-gold/10 bg-gold/[0.06] text-[var(--text-primary)]'
                      : 'border border-white/10 bg-white/[0.04] text-[var(--text-primary)]'
                  }`}
                >
                  {msg.typing ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--text-muted)]" />
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--text-muted)] [animation-delay:150ms]" />
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--text-muted)] [animation-delay:300ms]" />
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
                {isInterviewer && (
                  <div className="flex items-center gap-1 self-end">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/5 hover:text-[var(--text-muted)]"
                      aria-label={t('replay')}
                    >
                      <Speaker size={16} strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/5 hover:text-[var(--text-muted)]"
                      aria-label={t('mute')}
                    >
                      <VolumeX size={16} strokeWidth={1.75} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Bottom input area */}
      <div className="shrink-0 border-t border-white/[0.08] bg-[var(--bg-panel)]/80 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isTranscribing ? t('transcribing') : t('typeAnswer')}
            disabled={isTranscribing}
            className="glass-input flex-1 px-4 py-3 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              setIsTranscribing(!isTranscribing);
              setTimeout(() => setIsTranscribing(false), 3000);
            }}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
              isTranscribing
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-gold'
            }`}
            aria-label={t('transcribing')}
          >
            <Mic size={20} strokeWidth={1.75} />
          </button>
          <Button
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl bg-gold text-[var(--bg-void)] hover:bg-gold-hover cursor-pointer"
          >
            <Send size={18} strokeWidth={1.75} />
          </Button>
        </div>
        <div className="mx-auto mt-3 flex max-w-3xl items-center justify-between">
          <span className="text-xs text-[var(--text-faint)]" />
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-[var(--text-muted)] hover:text-gold cursor-pointer"
            onClick={handleComplete}
          >
            {t('completeInterview')}
          </Button>
        </div>
      </div>
    </div>
  );
}
