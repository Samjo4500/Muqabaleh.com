'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Speaker, VolumeX, Volume2, Mic, MicOff, Send, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InterviewAvatar, LiveBadge, SkeletonBlock } from '@/components/brand';
import { toast } from 'sonner';
import { useRouter as useRouterNext } from 'next/navigation';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  role: 'interviewer' | 'candidate';
  text: string;
  typing?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function InterviewRoomPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const t = useTranslations('app.room');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouterNext();

  const [interviewId, setInterviewId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [showReportLink, setShowReportLink] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [interviewerWho, setInterviewerWho] = useState<'fahd' | 'noora'>('fahd');
  const [voice, setVoice] = useState<'fahd' | 'noora'>('fahd');
  const [interviewStatus, setInterviewStatus] = useState<string>('');

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
        const who = gender === 'FEMALE' ? 'noora' : 'fahd';
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

        // Count interviewer messages for question number
        const qCount = (interview.messages || []).filter(
          (m: { role: string }) => m.role.toLowerCase() === 'interviewer',
        ).length;
        setCurrentQuestion(qCount);

        // If PENDING, auto-start
        if (interview.status === 'PENDING') {
          setInterviewStatus('PENDING');
          await startInterview();
        } else if (interview.status === 'IN_PROGRESS') {
          // Try resume to get question count
          setInterviewStatus('IN_PROGRESS');
          try {
            const resumeRes = await fetch(`/api/interviews/${interviewId}/resume`, { method: 'POST' });
            if (resumeRes.ok) {
              const resumeData = await resumeRes.json();
              setTotalQuestions(resumeData.interview.totalQuestions || 5);
              setCurrentQuestion(resumeData.interview.questionNumber || qCount);
              // If resume returned messages, use those
              if (resumeData.interview.messages && resumeData.interview.messages.length > existing.length) {
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
            // Resume failed, that's okay — we have the existing messages
          }
        } else if (interview.status === 'COMPLETED') {
          setInterviewStatus('COMPLETED');
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
      if (interviewStatus === 'IN_PROGRESS' && !hasLeftRef.current) {
        e.preventDefault();
      }
    };

    const handlePopState = () => {
      if (interviewStatus === 'IN_PROGRESS' && !hasLeftRef.current) {
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
  }, [interviewStatus, t]);

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
      setInterviewStatus('IN_PROGRESS');
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

    // Add candidate message immediately
    setMessages((prev) => [...prev, { role: 'candidate', text: trimmed }]);

    // Add typing indicator for interviewer
    setMessages((prev) => [...prev, { role: 'interviewer', text: '', typing: true }]);

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
        // Remove typing indicator
        setMessages((prev) => prev.filter((m) => !m.typing));
        setIsSending(false);
        return;
      }

      const data = await res.json();
      setCurrentQuestion(data.questionNumber || currentQuestion);
      setTotalQuestions(data.totalQuestions || totalQuestions);

      // Replace typing indicator with actual response
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => !m.typing);
        return [...withoutTyping, { role: 'interviewer', text: data.question }];
      });

      // If done, show completion overlay
      if (data.done) {
        setInterviewStatus('COMPLETED');
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

  // TTS: play audio for a message
  const playTTS = useCallback(
    async (text: string) => {
      if (isMuted || !text) return;

      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice }),
        });

        if (!res.ok) {
          // 503 = TTS unavailable, show text only
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.play().catch(() => {
          // Autoplay blocked or error
        });
        audio.onended = () => {
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
        };
      } catch {
        // TTS failed silently
      }
    },
    [isMuted, voice],
  );

  // ASR: record and transcribe
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
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

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:h-screen lg:pt-0">
        <div className="flex items-center gap-3 border-b border-white/[0.08] bg-[var(--bg-panel)]/80 px-4 py-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        </div>
        <div className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            <SkeletonBlock lines={3} />
            <SkeletonBlock lines={2} />
            <SkeletonBlock lines={4} />
          </div>
        </div>
      </div>
    );
  }

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

      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.08] bg-[var(--bg-panel)]/80 px-4 py-3 backdrop-blur-md">
        <InterviewAvatar who={interviewerWho} size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {interviewerWho === 'fahd' ? '\u0641\u0647\u062F' : '\u0646\u0648\u0631\u0629'}
          </span>
          <span className="text-xs text-emerald">{t('connected')}</span>
        </div>
        <div className="ms-auto flex items-center gap-3">
          <LiveBadge />
          <span className="font-mono text-sm font-medium text-[var(--text-muted)]">
            {formatTime(seconds)}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
            {t('questionOf', {
              current: Math.min(currentQuestion, totalQuestions),
              total: totalQuestions,
            })}
          </span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-gold" />
              <p className="text-sm text-[var(--text-muted)]">{t('waitingForResponse')}</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isInterviewer = msg.role === 'interviewer';
            return (
              <div
                key={i}
                className={`flex gap-3 ${isInterviewer ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {isInterviewer && <InterviewAvatar who={interviewerWho} size="sm" />}
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
                {isInterviewer && !msg.typing && (
                  <div className="flex items-center gap-1 self-end">
                    <button
                      type="button"
                      onClick={() => playTTS(msg.text)}
                      className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/5 hover:text-[var(--text-muted)] cursor-pointer"
                      aria-label={t('replay')}
                    >
                      <Speaker size={16} strokeWidth={1.75} />
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
            disabled={isSending || isRecording || isTranscribing}
            className="glass-input flex-1 px-4 py-3 text-sm"
          />
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isSending || isTranscribing}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors cursor-pointer ${
              isRecording
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-gold'
            }`}
            aria-label={isRecording ? t('transcribing') : 'Microphone'}
          >
            {isRecording ? <MicOff size={20} strokeWidth={1.75} /> : <Mic size={20} strokeWidth={1.75} />}
          </button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="h-11 w-11 shrink-0 rounded-xl bg-gold text-[var(--bg-void)] hover:bg-gold-hover cursor-pointer disabled:opacity-40"
          >
            {isSending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} strokeWidth={1.75} />
            )}
          </Button>
        </div>
        <div className="mx-auto mt-3 flex max-w-3xl items-center justify-between">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-faint)] transition-colors hover:text-[var(--text-muted)] cursor-pointer"
            aria-label={isMuted ? t('unmute') : t('mute')}
          >
            {isMuted ? <VolumeX size={14} strokeWidth={1.75} /> : <Volume2 size={14} strokeWidth={1.75} />}
            {isMuted ? t('unmute') : t('mute')}
          </button>
          {interviewStatus === 'IN_PROGRESS' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[var(--text-muted)] hover:text-gold cursor-pointer"
              onClick={handleComplete}
            >
              {t('completeInterview')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
