'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  Speaker,
  VolumeX,
  Volume2,
  Mic,
  MicOff,
  Send,
  ChevronRight,
  Loader2,
  Home,
  MessageSquare,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InterviewAvatar,
  SkeletonBlock,
  ScoreRing,
  StatusIndicator,
  AudioReactBars,
} from '@/components/brand';
import { BackButton } from '@/components/navigation';
import { toast } from 'sonner';
import { useRouter as useRouterNext } from 'next/navigation';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type InterviewerWho = 'fahd' | 'noora';
type InterviewPhase = 'loading' | 'pending' | 'in_progress' | 'completed';

type ChatMessage = {
  role: 'interviewer' | 'candidate';
  text: string;
  typing?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDisplayStatus(
  phase: InterviewPhase,
  isSending: boolean
): 'online' | 'preparing' | 'analyzing' | 'completed' {
  if (phase === 'completed') return 'completed';
  if (isSending) return 'preparing';
  return 'online';
}

function getEstimatedScore(
  questionNumber: number,
  totalQuestions: number
): number {
  // Simulated live score based on question progress
  if (questionNumber === 0) return 0;
  const base = 5.5;
  const progress = questionNumber / totalQuestions;
  return Math.min(10, Math.round((base + progress * 3.5) * 10) / 10);
}

/* ------------------------------------------------------------------ */
/*  Speech Bubble                                                      */
/* ------------------------------------------------------------------ */

function InterviewerBubble({
  text,
  onPlayTTS,
  isSpeaking,
  isRTL,
}: {
  text: string;
  onPlayTTS: () => void;
  isSpeaking: boolean;
  isRTL: boolean;
}) {
  return (
    <div
      className={`flex gap-3 items-start ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Bubble */}
      <div
        className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl rounded-tl-sm border border-gold/10 bg-gold/[0.06] px-5 py-3.5 text-sm leading-relaxed text-[var(--text-primary)] ${
          isRTL ? 'bubble-tail-rtl' : 'bubble-tail-ltr'
        }`}
      >
        {text}
        {/* Waveform when speaking */}
        {isSpeaking && (
          <div className="mt-2 border-t border-gold/10 pt-2">
            <AudioReactBars
              audioElement={null}
              isPlaying={true}
              barCount={20}
              className="h-6"
            />
          </div>
        )}
      </div>
      {/* TTS button */}
      <button
        type="button"
        onClick={onPlayTTS}
        className="mt-1 shrink-0 rounded-lg p-2 text-[var(--text-faint)] transition-all hover:bg-gold/10 hover:text-gold cursor-pointer"
        aria-label="Replay"
      >
        <Speaker size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}

function CandidateBubble({ text, isRTL }: { text: string; isRTL: boolean }) {
  return (
    <div
      className={`flex items-start ${isRTL ? 'justify-end' : 'justify-start'}`}
    >
      <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-br-sm border border-white/[0.08] bg-white/[0.04] px-5 py-3.5 text-sm leading-relaxed text-[var(--text-primary)]">
        {text}
      </div>
    </div>
  );
}

function TypingBubble({ isRTL }: { isRTL: boolean }) {
  return (
    <div
      className={`flex items-start gap-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-gold/10 bg-gold/[0.04] px-5 py-4">
        <div className={`flex items-center gap-1.5 ${isRTL ? '' : 'flex-row-reverse'}`}>
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold/60" />
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold/60 [animation-delay:150ms]" />
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold/60 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Interviewer Side Panel                                             */
/* ------------------------------------------------------------------ */

function InterviewerPanel({
  who,
  phase,
  isSending,
  currentQuestion,
  totalQuestions,
  seconds,
  isMuted,
  onToggleMute,
  t,
  locale,
}: {
  who: InterviewerWho;
  phase: InterviewPhase;
  isSending: boolean;
  currentQuestion: number;
  totalQuestions: number;
  seconds: number;
  isMuted: boolean;
  onToggleMute: () => void;
  t: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const status = getDisplayStatus(phase, isSending);
  const estimatedScore = getEstimatedScore(currentQuestion, totalQuestions);
  const isRTL = locale === 'ar';
  const name = who === 'fahd' ? '\u0641\u0647\u062F' : '\u0646\u0648\u0631\u0629';

  return (
    <div className="flex h-full flex-col items-center justify-between py-8 px-4">
      {/* Top: Avatar + Name + Status */}
      <div className="flex flex-col items-center gap-4">
        <InterviewAvatar who={who} size="xl" pro />
        <div className="text-center">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{name}</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{t('interviewerName')}</p>
        </div>
        <StatusIndicator status={status} />
      </div>

      {/* Center: Score Ring */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-medium text-[var(--text-faint)]">{t('interviewScore')}</p>
        <ScoreRing
          value={phase === 'completed' ? 10 : estimatedScore}
          size={100}
          strokeWidth={5}
          animated
        />
      </div>

      {/* Bottom: Stats */}
      <div className="w-full max-w-[200px] space-y-4">
        {/* Question counter */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <MessageSquare size={14} strokeWidth={1.75} />
            <span className="text-xs">{t('question')}</span>
          </div>
          <span className="text-sm font-bold text-gold">
            {Math.min(currentQuestion, totalQuestions)}/{totalQuestions}
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
          <span className="text-xs text-[var(--text-muted)]">{t('timeElapsed')}</span>
          <span className="font-mono text-sm font-medium text-[var(--text-primary)]">
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:
            {String(seconds % 60).padStart(2, '0')}
          </span>
        </div>

        {/* Mute toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
            isMuted
              ? 'border-red-400/20 bg-red-400/5 text-red-400 hover:bg-red-400/10'
              : 'border-white/[0.06] bg-white/[0.03] text-[var(--text-muted)] hover:bg-white/[0.06]'
          }`}
        >
          {isMuted ? <VolumeX size={14} strokeWidth={1.75} /> : <Volume2 size={14} strokeWidth={1.75} />}
          {isMuted ? t('unmute') : t('mute')}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function InterviewRoomPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const t = useTranslations('app.room');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouterNext();

  const [interviewId, setInterviewId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<InterviewPhase>('loading');
  const [showComplete, setShowComplete] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [showReportLink, setShowReportLink] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [interviewerWho, setInterviewerWho] = useState<InterviewerWho>('fahd');
  const [voice, setVoice] = useState<'fahd' | 'noora'>('fahd');
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasLeftRef = useRef(false);

  // Get params
  useEffect(() => {
    params.then(({ id }) => {
      setInterviewId(id);
    });
  }, [params]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load interview on mount
  useEffect(() => {
    if (!interviewId) return;

    async function loadInterview() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/interviews/${interviewId}`);
        if (!res.ok) {
          toast.error(t('errorLoading'));
          router.push('/app/interviews');
          return;
        }

        const { interview } = await res.json();

        // Set interviewer avatar
        const gender = interview.interviewerGender as string;
        const who: InterviewerWho = gender === 'FEMALE' ? 'noora' : 'fahd';
        setInterviewerWho(who);
        setVoice(who);

        // Map existing messages
        const existing: ChatMessage[] = (interview.messages || []).map(
          (m: { role: string; content: string }) => ({
            role: m.role.toLowerCase() === 'interviewer' ? 'interviewer' : 'candidate',
            text: m.content,
          }),
        );
        setMessages(existing);

        // Count interviewer messages
        const qCount = (interview.messages || []).filter(
          (m: { role: string }) => m.role.toLowerCase() === 'interviewer',
        ).length;
        setCurrentQuestion(qCount);

        if (interview.status === 'PENDING') {
          setPhase('pending');
          await startInterview();
        } else if (interview.status === 'IN_PROGRESS') {
          setPhase('in_progress');
          try {
            const resumeRes = await fetch(`/api/interviews/${interviewId}/resume`, {
              method: 'POST',
            });
            if (resumeRes.ok) {
              const resumeData = await resumeRes.json();
              setTotalQuestions(resumeData.interview.totalQuestions || 5);
              setCurrentQuestion(resumeData.interview.questionNumber || qCount);
              if (
                resumeData.interview.messages &&
                resumeData.interview.messages.length > existing.length
              ) {
                const resumed: ChatMessage[] = resumeData.interview.messages.map(
                  (m: { role: string; content: string }) => ({
                    role: m.role === 'interviewer' ? 'interviewer' : 'candidate',
                    text: m.content,
                  }),
                );
                setMessages(resumed);
              }
            }
          } catch {
            // Resume failed, that's okay
          }
        } else if (interview.status === 'COMPLETED') {
          setPhase('completed');
          router.push(`/app/interview/${interviewId}/report`);
          return;
        }
      } catch {
        toast.error(t('errorLoading'));
        router.push('/app/interviews');
      } finally {
        setIsLoading(false);
      }
    }

    loadInterview();
  }, [interviewId]);

  // Leave confirmation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase === 'in_progress' && !hasLeftRef.current) {
        e.preventDefault();
      }
    };

    const handlePopState = () => {
      if (phase === 'in_progress' && !hasLeftRef.current) {
        const confirmed = window.confirm(t('confirmLeave'));
        if (!confirmed) {
          window.history.pushState(null, '');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.history.pushState(null, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [phase, t]);

  const startInterview = async () => {
    setIsSending(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'start' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error?.[locale] || data.error?.ar || t('errorSending');
        toast.error(errMsg);
        return;
      }

      const data = await res.json();
      setPhase('in_progress');
      setTotalQuestions(data.totalQuestions || 5);
      setCurrentQuestion(data.questionNumber || 1);

      setMessages((prev) => [
        ...prev,
        { role: 'interviewer', text: data.question },
      ]);
    } catch {
      toast.error(t('errorSending'));
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setMessage('');
    setIsSending(true);
    setSpeakingIdx(null);

    // Add candidate message
    setMessages((prev) => [...prev, { role: 'candidate', text: trimmed }]);
    // Add typing indicator
    setMessages((prev) => [
      ...prev,
      { role: 'interviewer', text: '', typing: true },
    ]);

    try {
      const res = await fetch(`/api/interviews/${interviewId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error?.[locale] || data.error?.ar || t('errorSending');
        toast.error(errMsg);
        setMessages((prev) => prev.filter((m) => !m.typing));
        setIsSending(false);
        return;
      }

      const data = await res.json();
      setCurrentQuestion(data.questionNumber || currentQuestion);
      setTotalQuestions(data.totalQuestions || totalQuestions);

      // Replace typing indicator
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => !m.typing);
        return [...withoutTyping, { role: 'interviewer', text: data.question }];
      });

      if (data.done) {
        setPhase('completed');
        handleComplete();
      }
    } catch {
      toast.error(t('errorSending'));
      setMessages((prev) => prev.filter((m) => !m.typing));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

  const handleEndEarly = () => {
    setShowEndConfirm(true);
  };

  const confirmEndEarly = () => {
    setShowEndConfirm(false);
    setPhase('completed');
    handleComplete();
  };

  // TTS
  const playTTS = useCallback(
    async (text: string, idx: number) => {
      if (isMuted || !text) return;

      // Stop current
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setSpeakingIdx(idx);

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice }),
        });

        if (!res.ok) {
          setSpeakingIdx(null);
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.play().catch(() => {});
        audio.onended = () => {
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          setSpeakingIdx(null);
        };
      } catch {
        setSpeakingIdx(null);
      }
    },
    [isMuted, voice],
  );

  // ASR
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (audioChunksRef.current.length === 0) return;

        setIsTranscribing(true);
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const res = await fetch(`/api/interviews/${interviewId}/transcribe`, {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              setMessage(data.text);
              inputRef.current?.focus();
            }
          } else {
            toast.error(t('transcriptionError'));
          }
        } catch {
          toast.error(t('transcriptionError'));
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch {
      toast.error(t('micError'));
    }
  }, [isRecording, interviewId, t]);

  /* ================================================================ */
  /*  RENDER                                                            */
  /* ================================================================ */

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-[var(--bg-void)]">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] bg-[var(--bg-panel)]/80 px-4 py-3 backdrop-blur-md">
          <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
          <div className="ms-auto h-5 w-16 animate-pulse rounded bg-white/10" />
        </div>
        {/* Split skeleton */}
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden w-[320px] shrink-0 border-e border-white/[0.08] bg-[var(--bg-panel)] lg:flex flex-col items-center justify-center gap-6 p-6">
            <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-white/5" />
            <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-[100px] w-[100px] animate-pulse rounded-full bg-white/5" />
          </div>
          <div className="flex-1 p-6">
            <SkeletonBlock lines={3} />
            <div className="mt-4"><SkeletonBlock lines={2} /></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--bg-void)] overflow-hidden">
      {/* ─── Completion overlay ─── */}
      {showComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-void)]/90 backdrop-blur-sm">
          <div className="mx-4 max-w-sm text-center">
            <ScoreRing
              value={10}
              size={96}
              strokeWidth={4}
              animated
              className="mx-auto mb-6"
            />
            <h2 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">
              {t('interviewComplete')}
            </h2>
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
              <Button
                onClick={() => {
                  hasLeftRef.current = true;
                  router.push(`/app/interview/${interviewId}/report`);
                }}
                className="btn-gold cursor-pointer"
              >
                {t('viewReport')}
                <ChevronRight size={16} strokeWidth={1.75} className="ms-1 inline" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ─── End interview confirmation dialog ─── */}
      {showEndConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-void)]/80 backdrop-blur-sm">
          <div className="glass-card mx-4 max-w-sm p-6 text-center" style={{ transform: 'none' }}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10">
              <AlertTriangle size={24} className="text-amber-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)]">
              {t('endInterview')}
            </h3>
            <p className="mb-6 text-sm text-[var(--text-muted)]">{t('endConfirm')}</p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 cursor-pointer border border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                onClick={() => setShowEndConfirm(false)}
              >
                {t('endNo')}
              </Button>
              <Button
                className="flex-1 cursor-pointer bg-red-500/90 text-white hover:bg-red-500"
                onClick={confirmEndEarly}
              >
                {t('endYes')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Top Header Bar ─── */}
      <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.08] bg-[var(--bg-panel)]/80 px-4 py-2.5 backdrop-blur-md">
        <BackButton href={`/${locale}/app/interviews`} label={t('backToInterviews')} className="text-sm" />
        <span className="hidden text-[var(--text-faint)] sm:inline">/</span>
        <Link
          href={`/${locale}`}
          className="hidden items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] sm:inline-flex"
        >
          <Home size={14} strokeWidth={1.75} />
          <span>{t('home')}</span>
        </Link>
        {/* Mobile avatar + status (only visible on small screens) */}
        <div className="flex items-center gap-2 ms-auto lg:hidden">
          <InterviewAvatar who={interviewerWho} size="sm" pro />
          <StatusIndicator status={getDisplayStatus(phase, isSending)} />
          <span className="font-mono text-sm font-medium text-[var(--text-muted)]">
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
          </span>
        </div>
        {/* Desktop question counter (visible on lg+) */}
        <div className="ms-auto hidden items-center gap-4 lg:flex">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
            {t('questionOf', { current: Math.min(currentQuestion, totalQuestions), total: totalQuestions })}
          </span>
          {phase === 'in_progress' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 cursor-pointer"
              onClick={handleEndEarly}
            >
              <X size={14} strokeWidth={1.75} className="me-1" />
              {t('endInterview')}
            </Button>
          )}
        </div>
      </header>

      {/* ─── Split-screen body ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT PANEL: Interviewer (desktop) ─── */}
        <aside className="hidden w-[320px] shrink-0 flex-col border-e border-white/[0.08] bg-[var(--bg-panel)] lg:flex">
          <InterviewerPanel
            who={interviewerWho}
            phase={phase}
            isSending={isSending}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            seconds={seconds}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            t={t}
            locale={locale}
          />
        </aside>

        {/* ─── RIGHT PANEL: Chat ─── */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl space-y-5">
              {messages.length === 0 && (
                <div className="py-20 text-center">
                  <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-gold" />
                  <p className="text-sm text-[var(--text-muted)]">{t('waitingForResponse')}</p>
                </div>
              )}

              {messages.map((msg, i) => {
                if (msg.typing) {
                  return <TypingBubble key={`typing-${i}`} isRTL={isRTL} />;
                }
                if (msg.role === 'interviewer') {
                  return (
                    <InterviewerBubble
                      key={i}
                      text={msg.text}
                      onPlayTTS={() => playTTS(msg.text, i)}
                      isSpeaking={speakingIdx === i}
                      isRTL={isRTL}
                    />
                  );
                }
                return <CandidateBubble key={i} text={msg.text} isRTL={isRTL} />;
              })}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* ─── Bottom input area ─── */}
          <div className="shrink-0 border-t border-white/[0.08] bg-[var(--bg-panel)]/80 p-3 md:p-4 backdrop-blur-md">
            <div className="mx-auto flex max-w-2xl items-center gap-2 md:gap-3">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRecording
                    ? t('recording')
                    : isTranscribing
                      ? t('transcribing')
                      : t('typeAnswer')
                }
                disabled={isSending || isRecording || isTranscribing || phase === 'completed'}
                className="glass-input flex-1 px-4 py-3 text-sm"
              />
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isSending || isTranscribing || phase === 'completed'}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-gold'
                }`}
                aria-label={isRecording ? t('transcribing') : 'Microphone'}
              >
                {isRecording ? (
                  <MicOff size={20} strokeWidth={1.75} />
                ) : (
                  <Mic size={20} strokeWidth={1.75} />
                )}
              </button>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isSending || !message.trim() || phase === 'completed'}
                className="h-11 w-11 shrink-0 rounded-xl bg-gold text-[var(--bg-void)] hover:bg-gold-hover cursor-pointer disabled:opacity-40"
              >
                {isSending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} strokeWidth={1.75} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
