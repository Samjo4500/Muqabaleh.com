'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  use,
} from 'react';
import {
  VolumeX,
  Volume2,
  Send,
  Loader2,
  ArrowUpLeft,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  InterviewAvatar,
  StatusIndicator,
  AudioReactBars,
  ScoreRing,
} from '@/components/brand';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { easeCrystal } from '@/components/landing/crystal/motion';
import { localePath } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type InterviewerWho = 'fahd' | 'noora';
type Phase = 'booting' | 'live' | 'sending' | 'done';

type ChatMessage = {
  id: string;
  role: 'interviewer' | 'candidate';
  text: string;
  typing?: boolean;
};

function stripDoneTag(text: string) {
  return text.replace(/\[INTERVIEW_DONE\]/gi, '').trim();
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function estimatedScore(questionNumber: number, totalQuestions: number) {
  if (questionNumber <= 0) return 0;
  const progress = Math.min(1, questionNumber / Math.max(1, totalQuestions));
  return Math.min(10, Math.round((5.4 + progress * 3.8) * 10) / 10);
}

export default function GuestInterviewRoom({
  params,
}: {
  params: Promise<{ token: string; locale: string }>;
}) {
  const { token } = use(params);
  const t = useTranslations('app.room');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [phase, setPhase] = useState<Phase>('booting');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [who] = useState<InterviewerWho>('fahd');
  const [isMuted, setIsMuted] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer only after interview is live
  useEffect(() => {
    if (!timerOn || phase === 'done') return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerOn, phase]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playTTS = useCallback(
    async (text: string, msgId: string) => {
      if (isMuted || !text || !token) return;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setSpeakingId(msgId);
      try {
        const res = await fetch(`/api/guest/${token}/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice: who }),
        });
        if (!res.ok) {
          setSpeakingId(null);
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play().catch(() => setSpeakingId(null));
        audio.onended = () => {
          setSpeakingId(null);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
      } catch {
        setSpeakingId(null);
      }
    },
    [isMuted, token, who],
  );

  // Boot: hydrate from join handoff OR start interview
  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;

    const boot = async () => {
      const storageKey = `mq-guest-start:${token}`;
      try {
        const cached = sessionStorage.getItem(storageKey);
        if (cached) {
          const data = JSON.parse(cached) as {
            question?: string;
            questionNumber?: number;
            totalQuestions?: number;
          };
          sessionStorage.removeItem(storageKey);
          if (data.question) {
            const clean = stripDoneTag(data.question);
            setMessages([{ id: 'q1', role: 'interviewer', text: clean }]);
            setCurrentQuestion(data.questionNumber || 1);
            setTotalQuestions(data.totalQuestions || 5);
            setPhase('live');
            setTimerOn(true);
            setTimeout(() => playTTS(clean, 'q1'), 400);
            return;
          }
        }
      } catch {
        // ignore storage errors
      }

      try {
        const res = await fetch(`/api/guest/${token}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'start' }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const errMsg = data.error?.[locale] || data.error?.ar || t('errorLoading');
          toast.error(errMsg);
          setPhase('live');
          return;
        }
        const data = await res.json();
        const history = Array.isArray(data.history)
          ? (data.history as Array<{ role: 'interviewer' | 'candidate'; text: string }>)
          : null;

        if (history && history.length > 0) {
          const hydrated = history.map((m, i) => ({
            id: `h-${i}`,
            role: m.role,
            text: stripDoneTag(m.text),
          }));
          setMessages(hydrated);
          setCurrentQuestion(data.questionNumber || 1);
          setTotalQuestions(data.totalQuestions || 5);
          setPhase(data.done ? 'done' : 'live');
          setTimerOn(true);
          const lastIv = [...hydrated].reverse().find((m) => m.role === 'interviewer');
          if (lastIv) setTimeout(() => playTTS(lastIv.text, lastIv.id), 400);
        } else {
          const clean = stripDoneTag(data.question || '');
          const firstId = 'q1';
          setMessages(clean ? [{ id: firstId, role: 'interviewer', text: clean }] : []);
          setCurrentQuestion(data.questionNumber || 1);
          setTotalQuestions(data.totalQuestions || 5);
          setPhase(data.done ? 'done' : 'live');
          setTimerOn(true);
          if (clean) setTimeout(() => playTTS(clean, firstId), 400);
        }
      } catch {
        toast.error(t('errorLoading'));
        setPhase('live');
      }
    };

    void boot();
  }, [token, locale, t, playTTS]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || phase !== 'live' || !token) return;

    setDraft('');
    setPhase('sending');
    const candidateId = `c-${Date.now()}`;
    const typingId = `t-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: candidateId, role: 'candidate', text: trimmed },
      { id: typingId, role: 'interviewer', text: '', typing: true },
    ]);

    try {
      const res = await fetch(`/api/guest/${token}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error?.[locale] || data.error?.ar || t('errorSending');
        toast.error(errMsg);
        setMessages((prev) => prev.filter((m) => m.id !== typingId));
        setPhase('live');
        return;
      }

      const data = await res.json();
      const clean = stripDoneTag(data.question || '');
      setCurrentQuestion(data.questionNumber || currentQuestion);
      setTotalQuestions(data.totalQuestions || totalQuestions);

      const replyId = `i-${Date.now()}`;
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.id !== typingId);
        return clean
          ? [...withoutTyping, { id: replyId, role: 'interviewer', text: clean }]
          : withoutTyping;
      });

      if (data.done) {
        setPhase('done');
      } else {
        setPhase('live');
        if (clean) setTimeout(() => playTTS(clean, replyId), 250);
      }
    } catch {
      toast.error(t('errorSending'));
      setMessages((prev) => prev.filter((m) => m.id !== typingId));
      setPhase('live');
    } finally {
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const status =
    phase === 'done'
      ? 'completed'
      : phase === 'sending'
        ? 'analyzing'
        : phase === 'booting'
          ? 'preparing'
          : 'online';

  const score = estimatedScore(currentQuestion, totalQuestions);
  const interviewerName = who === 'fahd' ? t('fahdName') : t('nooraName');

  return (
    <div
      className="mq-atelier relative flex h-[100dvh] flex-col overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
        <div className="mq-orb mq-orb-c" />
      </div>

      {/* Completion */}
      <AnimatePresence>
        {phase === 'done' ? (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#05080f]/88 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mq-panel mq-facet mq-facet-teal mq-facet-shape-soft w-full max-w-md p-8 text-center"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: easeCrystal }}
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/15">
                <Sparkles className="text-teal-300" size={28} />
              </div>
              <h2 className="mq-display mb-2 text-2xl font-bold text-white">
                {t('guestCompleteTitle')}
              </h2>
              <p className="mb-7 text-sm leading-relaxed text-white/60">
                {t('guestCompleteBody')}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href={localePath('/register', locale)}
                  className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center justify-center gap-2 px-5 text-sm font-bold"
                >
                  {t('guestCreateAccount')}
                  <Arrow size={16} />
                </Link>
                <Link
                  href={localePath('/demo', locale)}
                  className="mq-btn mq-btn-ghost inline-flex min-h-[44px] items-center justify-center px-5 text-sm font-bold"
                >
                  {t('guestTryAgain')}
                </Link>
                <Link
                  href={localePath('/', locale)}
                  className="text-xs font-semibold text-white/40 transition hover:text-teal-300"
                >
                  {t('guestBackHome')}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Top bar */}
      <header className="relative z-20 shrink-0 border-b border-white/10 bg-[rgba(8,12,22,0.72)] px-3 py-3 backdrop-blur-xl md:px-5">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link href={localePath('/', locale)} className="shrink-0" aria-label="Muqabaleh">
            <BrandLogo size="nav" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-teal-300/90">
              {t('guestKicker')}
            </p>
            <p className="truncate text-xs text-white/45 md:text-sm">
              {t('questionOf', {
                current: Math.min(Math.max(currentQuestion, 1), totalQuestions),
                total: totalQuestions,
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-[10px] font-bold tracking-wide text-rose-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
              </span>
              LIVE
            </span>
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs tabular-nums text-white/70">
              {formatTime(seconds)}
            </span>
          </div>
        </div>
      </header>

      {/* Stage */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col gap-4 p-3 md:flex-row md:gap-5 md:p-5">
        {/* Presence panel */}
        <aside className="mq-panel mq-facet mq-facet-teal mq-facet-shape-soft relative hidden w-[280px] shrink-0 flex-col items-center justify-between overflow-hidden p-6 lg:flex">
          <div className="flex flex-col items-center gap-4 text-center">
            <InterviewAvatar who={who} size="xl" pro />
            <div>
              <h2 className="mq-display text-xl font-bold text-white">{interviewerName}</h2>
              <p className="mt-1 text-xs text-white/45">{t('interviewerName')}</p>
            </div>
            <StatusIndicator status={status} />
            <p className="text-[11px] text-white/40">
              {speakingId ? t('speaking') : t('listening')}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-white/35">
              {t('interviewScore')}
            </p>
            <ScoreRing value={score} size={96} />
          </div>

          <p className="text-center text-[11px] leading-relaxed text-white/40">{t('guestTip')}</p>
        </aside>

        {/* Chat column */}
        <section className="mq-panel relative flex min-h-0 flex-1 flex-col overflow-hidden border-teal-300/15">
          {/* Mobile interviewer strip */}
          <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3 lg:hidden">
            <InterviewAvatar who={who} size="md" pro />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{interviewerName}</p>
              <StatusIndicator status={status} className="mt-1" />
            </div>
            <ScoreRing value={score} size={52} strokeWidth={4} />
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 md:px-6 md:py-6">
            {phase === 'booting' ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
                <Loader2 className="animate-spin text-teal-300" size={28} />
                <p className="text-sm text-white/55">{t('guestPreparing')}</p>
              </div>
            ) : null}

            {messages.map((msg) => {
              const isInterviewer = msg.role === 'interviewer';
              if (msg.typing) {
                return (
                  <div
                    key={msg.id}
                    className={cn('flex', isAr ? 'justify-start' : 'justify-end')}
                  >
                    <div className="rounded-2xl border border-teal-300/20 bg-teal-400/8 px-5 py-4">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-teal-300/70" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-teal-300/70 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-teal-300/70 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: easeCrystal }}
                  className={cn(
                    'flex gap-3',
                    isInterviewer
                      ? isAr
                        ? 'justify-start'
                        : 'justify-end'
                      : isAr
                        ? 'justify-end'
                        : 'justify-start',
                  )}
                >
                  {isInterviewer ? (
                    <div className="max-w-[88%] md:max-w-[75%]">
                      <div className="rounded-2xl border border-teal-300/20 bg-gradient-to-br from-teal-400/12 to-transparent px-4 py-3.5 text-sm leading-relaxed text-white md:px-5">
                        {msg.text}
                        {speakingId === msg.id ? (
                          <div className="mt-3 border-t border-white/10 pt-2">
                            <AudioReactBars
                              audioElement={null}
                              isPlaying
                              barCount={18}
                              className="h-6"
                            />
                          </div>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => playTTS(msg.text, msg.id)}
                        className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/40 transition hover:text-teal-300"
                      >
                        <Volume2 size={13} />
                        {t('replay')}
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-[88%] rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm leading-relaxed text-white/90 md:max-w-[75%] md:px-5">
                      {msg.text}
                    </div>
                  )}
                </motion.div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-white/10 bg-black/20 p-3 md:p-4">
            <div className="flex items-end gap-2 md:gap-3">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder={t('typeAnswer')}
                disabled={phase !== 'live'}
                className="min-h-[52px] flex-1 resize-none rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/35 focus:border-teal-300/40 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={phase !== 'live' || !draft.trim()}
                className="mq-btn mq-btn-primary inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center disabled:opacity-40"
                aria-label={t('send')}
              >
                {phase === 'sending' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 px-1">
              <p className="text-[11px] text-white/35 md:hidden">{t('guestTip')}</p>
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className="ms-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/40 transition hover:text-teal-300"
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                {isMuted ? t('unmute') : t('mute')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
