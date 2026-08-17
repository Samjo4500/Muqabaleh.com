'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loader2, Mic, MicOff, Send, Square } from 'lucide-react';
import { AtelierFlowShell } from '@/components/landing/crystal/AtelierFlowShell';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';
import type { ChatMessage, CoachScoreResult, PrepSelections } from '@/lib/coach/types';
import { trackGaEvent } from '@/lib/analytics-ga';
import { Gate1Passport } from '@/components/nurture/Gate1Passport';
import { readNurture } from '@/components/nurture/gate-storage';
import { GATE1 } from '@/lib/nurture/copy';
import { scoreBarColor } from '@/components/nurture/GateShell';

type Props = { candidateName: string };

type ResultState = {
  interviewId?: string;
  verificationId?: string;
  score: CoachScoreResult;
  passportPdfUnlocked?: boolean;
  emailed?: boolean;
  upgradeRequired?: boolean;
};

const PREP_KEY = 'mq_coach_prep';
const SESSION_KEY = 'mq_coach_session';

export function CoachSessionClient({ candidateName }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();

  const [prep, setPrep] = useState<PrepSelections | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const historyRef = useRef<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [coachMeta, setCoachMeta] = useState<{
    name: string;
    image: string;
    heygen: boolean;
    heygenUrl: string;
  } | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const answerInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [voiceFallback, setVoiceFallback] = useState(false);
  const [passportUnlocked, setPassportUnlocked] = useState(false);
  const [gate1Open, setGate1Open] = useState(false);

  const setHistoryBoth = (next: ChatMessage[]) => {
    historyRef.current = next;
    setHistory(next);
  };

  const setSessionBoth = (id: string) => {
    sessionIdRef.current = id;
    setSessionId(id);
    try {
      sessionStorage.setItem(SESSION_KEY, id);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (readNurture().unlocked) setPassportUnlocked(true);
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PREP_KEY);
      if (!raw) {
        router.replace(localePath('/interview/prep', locale));
        return;
      }
      setPrep(JSON.parse(raw) as PrepSelections);
    } catch {
      router.replace(localePath('/interview/prep', locale));
    }
  }, [locale, router]);

  useEffect(() => {
    if (!prep) return;
    fetch('/api/interview/coach/config')
      .then((r) => r.json())
      .then((c) => {
        const gender = prep.coachGender === 'male' ? 'male' : 'female';
        const coach = c.coaches?.[gender];
        setCoachMeta({
          name: gender === 'male' ? 'Jean' : 'Jeannie',
          image: coach?.image || '/images/hero-interview.webp',
          heygen: !!c.heygen?.enabled,
          heygenUrl: c.heygen?.iframeBaseUrl || '',
        });
      })
      .catch(() => {
        setCoachMeta({
          name: prep.coachGender === 'male' ? 'Jean' : 'Jeannie',
          image: '/images/hero-interview.webp',
          heygen: false,
          heygenUrl: '',
        });
      });
  }, [prep]);

  // Soft anti-cheat: tab blur / visibility hidden → integrity signal
  useEffect(() => {
    if (!sessionId) return;
    const send = (signal: 'tab_blur' | 'visibility_hidden') => {
      void fetch('/api/interview/coach/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, signal }),
        keepalive: true,
      }).catch(() => undefined);
    };
    const onVis = () => {
      if (document.visibilityState === 'hidden') send('visibility_hidden');
    };
    const onBlur = () => send('tab_blur');
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
    };
  }, [sessionId]);

  const speak = useCallback(
    async (
      text: string,
      coachGender: PrepSelections['coachGender'],
      languageHint: PrepSelections['language'],
    ) => {
      try {
        const res = await fetch('/api/interview/coach/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            coachGender,
            languageHint,
            sessionId: sessionIdRef.current,
          }),
        });
        const data = (await res.json()) as { audioBase64?: string | null; mimeType?: string };
        if (!data.audioBase64) return;
        const src = `data:${data.mimeType || 'audio/mpeg'};base64,${data.audioBase64}`;
        audioRef.current?.pause();
        const audio = new Audio(src);
        audioRef.current = audio;
        setSpeaking(true);
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        await audio.play().catch(() => setSpeaking(false));
      } catch {
        setSpeaking(false);
      }
    },
    [],
  );

  const finalize = useCallback(
    async (currentPrep: PrepSelections, currentHistory: ChatMessage[]) => {
      setBusy(true);
      try {
        const res = await fetch('/api/interview/coach/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prep: currentPrep,
            history: currentHistory,
            sessionId: sessionIdRef.current,
          }),
        });
        const data = (await res.json()) as ResultState & {
          ok?: boolean;
          error?: string;
          upgradeRequired?: boolean;
        };
        if (res.status === 402) {
          setError(
            data.error ||
              (isAr
                ? 'وصلت إلى حد المقابلات. رقِّ حسابك للمتابعة.'
                : 'Interview quota reached. Upgrade to continue.'),
          );
          return;
        }
        if (data.score) {
          trackGaEvent('interview_completed', { source: 'coach' });
          setResult({
            interviewId: data.interviewId,
            verificationId: data.verificationId,
            score: data.score,
            passportPdfUnlocked: data.passportPdfUnlocked,
            emailed: data.emailed,
            upgradeRequired: data.upgradeRequired,
          });
          try {
            sessionStorage.removeItem(PREP_KEY);
            sessionStorage.removeItem(SESSION_KEY);
          } catch {
            /* ignore */
          }
        } else {
          setError(data.error || (isAr ? 'تعذّر التقييم.' : 'Could not score interview.'));
        }
      } catch {
        setError(isAr ? 'تعذّر إنهاء المقابلة بأمان.' : 'Could not finish safely.');
      } finally {
        setBusy(false);
      }
    },
    [isAr],
  );

  const runTurn = useCallback(
    async (currentPrep: PrepSelections, userMessage?: string) => {
      setBusy(true);
      setError(null);
      const prior = historyRef.current;
      try {
        const res = await fetch('/api/interview/coach/turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prep: currentPrep,
            history: prior,
            userMessage,
            sessionId: sessionIdRef.current,
          }),
        });
        const data = (await res.json()) as {
          reply?: string;
          complete?: boolean;
          error?: string;
          sessionId?: string;
          history?: ChatMessage[];
          upgradeRequired?: boolean;
        };
        if (res.status === 402) {
          setError(
            data.error ||
              (isAr
                ? 'وصلت إلى حد المقابلات. رقِّ حسابك للمتابعة.'
                : 'Interview quota reached. Upgrade to continue.'),
          );
          return;
        }
        if (data.sessionId) setSessionBoth(data.sessionId);
        if (!data.reply) {
          setError(data.error || (isAr ? 'تعذّر الرد.' : 'Could not get a reply.'));
          return;
        }

        const next: ChatMessage[] =
          Array.isArray(data.history) && data.history.length
            ? data.history
            : (() => {
                const built: ChatMessage[] = [...prior];
                if (userMessage?.trim()) {
                  built.push({ role: 'user', content: userMessage.trim() });
                }
                built.push({ role: 'assistant', content: data.reply! });
                return built;
              })();
        setHistoryBoth(next);

        await speak(data.reply, currentPrep.coachGender, currentPrep.language);

        if (data.complete) {
          await finalize(currentPrep, next);
        }
      } catch {
        setError(isAr ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Try again.');
      } finally {
        setBusy(false);
      }
    },
    [finalize, isAr, speak],
  );

  useEffect(() => {
    if (!prep || startedRef.current) return;
    startedRef.current = true;

    (async () => {
      setBusy(true);
      try {
        let resumeIfActive = true;
        try {
          resumeIfActive = sessionStorage.getItem('mq_coach_resume') !== '0';
        } catch {
          /* ignore */
        }
        const res = await fetch('/api/interview/coach/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prep, resumeIfActive }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          sessionId?: string;
          history?: ChatMessage[];
          prep?: PrepSelections;
          resumed?: boolean;
          error?: string;
        };
        if (res.status === 402 || !data.sessionId) {
          setError(
            data.error ||
              (isAr
                ? 'وصلت إلى حد المقابلات. رقِّ حسابك للمتابعة.'
                : 'Interview quota reached. Upgrade to continue.'),
          );
          return;
        }
        setSessionBoth(data.sessionId);
        const activePrep = data.prep || prep;
        if (data.prep) setPrep(data.prep);
        if (Array.isArray(data.history) && data.history.length > 0) {
          setHistoryBoth(data.history);
          // Resumed mid-session — do not re-open with a fresh kickoff.
          return;
        }
        await runTurn(activePrep);
      } catch {
        setError(isAr ? 'تعذّر بدء الجلسة.' : 'Could not start session.');
      } finally {
        setBusy(false);
      }
    })();
  }, [prep, runTurn, isAr]);

  const submitText = async () => {
    if (!prep || !input.trim() || busy) return;
    const msg = input.trim();
    setInput('');
    await runTurn(prep, msg);
  };

  const stopInterview = async () => {
    if (!prep || busy) return;
    const next: ChatMessage[] = [
      ...historyRef.current,
      {
        role: 'user',
        content: isAr ? 'أريد إنهاء المقابلة الآن.' : 'I want to stop the interview now.',
      },
    ];
    setHistoryBoth(next);
    await finalize(prep, next);
  };

  const toggleRecord = async () => {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        const fd = new FormData();
        fd.append('audio', blob, 'answer.webm');
        fd.append('language', prep?.language || 'mixed');
        setBusy(true);
        try {
          const res = await fetch('/api/speech-to-text', { method: 'POST', body: fd });
          const data = (await res.json()) as {
            text?: string;
            fallback?: boolean;
            error?: string;
          };
          if (data.text?.trim() && prep) {
            setError(null);
            setVoiceFallback(false);
            await runTurn(prep, data.text.trim());
          } else {
            setVoiceFallback(true);
            setError(
              isAr
                ? 'لم نتمكن من سماع صوتك. اكتب إجابتك هنا:'
                : "We couldn't hear you. Type your answer below:",
            );
            window.setTimeout(() => answerInputRef.current?.focus(), 50);
          }
        } catch {
          setVoiceFallback(true);
          setError(
            isAr
              ? 'لم نتمكن من سماع صوتك. اكتب إجابتك هنا:'
              : "We couldn't hear you. Type your answer below:",
          );
          window.setTimeout(() => answerInputRef.current?.focus(), 50);
        } finally {
          setBusy(false);
        }
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError(isAr ? 'الميكروفون غير متاح.' : 'Microphone unavailable.');
    }
  };

  if (!prep) {
    return (
      <AtelierFlowShell>
        <div className="flex min-h-[40vh] items-center justify-center text-white/60">
          <Loader2 className="animate-spin" />
        </div>
      </AtelierFlowShell>
    );
  }

  if (result) {
    const copy = isAr ? GATE1.ar : GATE1.en;
    if (!passportUnlocked) {
      return (
        <AtelierFlowShell>
          <div
            className="mq-wrap flex min-h-[70vh] flex-col items-center justify-center py-16 text-center"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <BrandLogo size="nav" />
            <h1 className="mq-display mt-8 text-3xl font-bold text-white md:text-5xl">
              {copy.completeTitle}
            </h1>
            <p className="mt-3 max-w-md text-white/55">{copy.completeSub}</p>
            <button
              type="button"
              onClick={() => setGate1Open(true)}
              className="mt-8 inline-flex h-12 min-w-[240px] items-center justify-center rounded-3xl bg-[#C9A84C] px-6 text-sm font-extrabold text-black hover:bg-[#D4B86A]"
            >
              {copy.seeResults}
            </button>
          </div>
          <Gate1Passport
            open={gate1Open}
            isAr={isAr}
            locale={locale}
            score={result.score}
            role={prep?.roleTitle || prep?.role}
            company={prep?.companyName}
            onUnlocked={() => setPassportUnlocked(true)}
          />
        </AtelierFlowShell>
      );
    }
    return (
      <ResultsView
        isAr={isAr}
        locale={locale}
        candidateName={candidateName}
        result={result}
        unlocked
      />
    );
  }

  const coachName = coachMeta?.name || (prep.coachGender === 'male' ? 'Jean' : 'Jeannie');

  return (
    <AtelierFlowShell>
      <div
        className="mq-wrap flex min-h-[100svh] flex-col py-8 md:py-10"
        dir={isAr ? 'rtl' : 'ltr'}
        lang={isAr ? 'ar' : 'en'}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href={localePath('/', locale)} aria-label="Muqabaleh">
            <BrandLogo size="nav" />
          </Link>
          <button
            type="button"
            onClick={() => void stopInterview()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            <Square size={14} />
            {isAr ? 'إنهاء' : 'End'}
          </button>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            {coachMeta?.heygen && coachMeta.heygenUrl ? (
              <iframe
                title={coachName}
                src={coachMeta.heygenUrl}
                className="aspect-square w-full rounded-2xl border border-white/10"
                allow="autoplay; microphone"
              />
            ) : (
              <div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-full border border-teal-300/40">
                <Image
                  src={coachMeta?.image || '/images/hero-interview.webp'}
                  alt={coachName}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
                {speaking ? (
                  <div className="absolute inset-x-4 bottom-4 flex h-8 items-end justify-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 animate-pulse rounded-full bg-teal-300"
                        style={{
                          height: `${10 + ((i * 7) % 18)}px`,
                          animationDelay: `${i * 0.12}s`,
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )}
            <p className="mt-4 text-center text-xl font-bold text-white">{coachName}</p>
            <p className="mt-1 text-center text-sm text-white/50">
              {isAr ? 'مدرب مقابلات مقابلة' : 'Muqabaleh interview coach'}
            </p>
            {sessionId ? (
              <p className="mt-3 text-center text-[11px] text-white/30">
                {isAr ? 'الجلسة محفوظة' : 'Session saved'}
              </p>
            ) : null}
          </aside>

          <section className="flex min-h-[60vh] flex-col rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
              {history.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'assistant'
                      ? 'bg-teal-400/10 text-teal-50'
                      : 'ms-auto bg-white/10 text-white'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {busy ? (
                <div className="inline-flex items-center gap-2 text-sm text-white/50">
                  <Loader2 className="animate-spin" size={16} />
                  {isAr ? 'جاري التفكير…' : 'Thinking…'}
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 p-4">
              {error ? (
                <p className={`mb-2 text-sm ${voiceFallback ? 'text-amber-200' : 'text-rose-300'}`}>
                  {error}
                </p>
              ) : null}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => void toggleRecord()}
                  disabled={busy}
                  className={`rounded-xl border p-3 ${
                    recording
                      ? 'border-rose-300/50 bg-rose-500/20 text-rose-100'
                      : 'border-white/15 text-white/70 hover:bg-white/5'
                  }`}
                  aria-label={recording ? 'Stop' : 'Record'}
                >
                  {recording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <textarea
                  ref={answerInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={voiceFallback ? 3 : 2}
                  disabled={busy}
                  placeholder={
                    voiceFallback
                      ? isAr
                        ? 'اكتب إجابتك هنا…'
                        : 'Type your answer here…'
                      : isAr
                        ? 'اكتب إجابتك…'
                        : 'Type your answer…'
                  }
                  className={`min-h-[48px] flex-1 resize-none rounded-xl border bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/35 ${
                    voiceFallback
                      ? 'border-amber-300/50 ring-1 ring-amber-300/30'
                      : 'border-white/12'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => void submitText()}
                  disabled={busy || !input.trim()}
                  className="mq-btn mq-btn-primary inline-flex min-h-[48px] items-center gap-2 px-4 disabled:opacity-50"
                >
                  <Send size={16} />
                  {isAr ? 'إرسال' : 'Send'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AtelierFlowShell>
  );
}

function ResultsView({
  isAr,
  locale,
  candidateName,
  result,
  unlocked = false,
}: {
  isAr: boolean;
  locale: string;
  candidateName: string;
  result: ResultState;
  unlocked?: boolean;
}) {
  const score = result.score;
  const provisional = score.scoringMode === 'provisional';
  const verifyUrl = result.verificationId
    ? `https://muqabaleh.com/verify/${result.verificationId}`
    : '';
  const blurScorecard = result.upgradeRequired && !provisional && !unlocked;

  return (
    <AtelierFlowShell>
      <div
        className="mq-wrap py-10 md:py-14"
        dir={isAr ? 'rtl' : 'ltr'}
        lang={isAr ? 'ar' : 'en'}
      >
        <Link href={localePath('/', locale)} aria-label="Muqabaleh">
          <BrandLogo size="nav" />
        </Link>
        <h1 className="mq-display mt-8 text-3xl font-bold text-white md:text-5xl">
          {provisional
            ? isAr
              ? 'تقدير مؤقت للتدريب'
              : 'Provisional practice estimate'
            : isAr
              ? 'جواز مقابلتك جاهز'
              : 'Your Interview Passport'}
        </h1>
        <p className="mt-2 text-white/60">
          {candidateName} · {score.overallScore}/100 · {score.grade}
        </p>
        {provisional ? (
          <p className="mt-3 max-w-xl text-sm text-amber-200/90">
            {isAr
              ? 'هذا تقدير مبدئي مبني على طول الإجابات وليس تقييماً نموذجياً. جواز PDF غير متاح حتى يعمل التقييم بالذكاء الاصطناعي.'
              : 'This is a length-based provisional estimate, not a model evaluation. Passport PDF unlocks only after AI model scoring succeeds.'}
          </p>
        ) : null}

        <div
          className={`relative mt-8 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 ${
            blurScorecard ? 'overflow-hidden' : ''
          }`}
        >
          <div className={blurScorecard ? 'blur-sm select-none' : ''}>
            <p className="text-4xl font-bold text-[#C9A84C]">
              {score.overallScore}{' '}
              <span className="text-xl text-white/70">{score.grade}</span>
            </p>
            <ul className="mt-6 space-y-3">
              {score.competencyBreakdown.map((c) => (
                <li key={c.name}>
                  <div className="mb-1 flex justify-between text-sm text-white/70">
                    <span>{c.name}</span>
                    <span>{c.score}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className={`h-2 rounded-full ${scoreBarColor(c.score)}`}
                      style={{ width: `${Math.max(0, Math.min(100, c.score))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-bold text-white/50">
                  {isAr ? 'نقاط القوة' : 'Strengths'}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-white/80">
                  {score.strengths.slice(0, 3).map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold text-white/50">
                  {isAr ? 'للتحسين' : 'Improvements'}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-white/80">
                  {score.improvements.slice(0, 3).map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 text-sm text-white/70">{score.recommendedNextSteps}</p>
          </div>

          {blurScorecard ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05080f]/55 p-6 text-center backdrop-blur-[2px]">
              <p className="max-w-sm text-lg font-bold text-white">
                {isAr
                  ? 'الباقة المجانية تعرض معاينة فقط. رقِّ لفتح جواز PDF الكامل.'
                  : 'Free tier shows a blurred preview. Upgrade to unlock the full passport PDF.'}
              </p>
              <Link href={localePath('/#pricing', locale)} className="mq-btn mq-btn-primary mt-4">
                {isAr ? 'ترقية الآن' : 'Upgrade now'}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={localePath('/interview/prep', locale)}
            className="inline-flex h-12 items-center justify-center rounded-3xl bg-[#C9A84C] px-6 text-sm font-extrabold text-black hover:bg-[#D4B86A]"
          >
            {isAr ? 'تدرّب مرة أخرى' : 'PRACTICE AGAIN'}
          </Link>
          <Link
            href={localePath('/jobs', locale)}
            className="inline-flex h-12 items-center justify-center rounded-3xl border border-[#00D4AA] px-6 text-sm font-extrabold text-[#00D4AA]"
          >
            {isAr ? 'تصفّح الوظائف' : 'BROWSE ROLES'}
          </Link>
        </div>

        {!result.upgradeRequired && !provisional && result.interviewId ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`/api/interview/coach/passport?interviewId=${result.interviewId}`}
              className="mq-btn mq-btn-primary"
              onClick={() => trackGaEvent('passport_downloaded', { source: 'coach' })}
            >
              {isAr ? 'تحميل PDF' : 'Download PDF'}
            </a>
            {verifyUrl ? (
              <>
                <a
                  className="mq-btn mq-btn-ghost"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
                <a
                  className="mq-btn mq-btn-ghost"
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(verifyUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  X
                </a>
              </>
            ) : null}
          </div>
        ) : null}

        {result.emailed ? (
          <p className="mt-4 text-sm text-teal-200/80">
            {isAr ? 'تم إرسال جواز المقابلة إلى بريدك.' : 'Passport emailed to your inbox.'}
          </p>
        ) : null}
      </div>
    </AtelierFlowShell>
  );
}
