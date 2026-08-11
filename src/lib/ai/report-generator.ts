import { averageScores, scoreBandLabel, scoreToGrade } from '@/lib/interview/scoring';
import { evaluateAnswer } from './interviewer';

export type ResponseSummary = {
  questionId: string;
  questionText: string;
  questionTextAr?: string | null;
  userAnswer: string;
  contentScore?: number | null;
  structureScore?: number | null;
  confidenceScore?: number | null;
  overallScore?: number | null;
  feedbackText?: string | null;
  improvementTip?: string | null;
};

export type FinalReport = {
  overallScore: number;
  grade: string;
  summary: string;
  summaryAr: string;
  strengths: string[];
  strengthsAr: string[];
  weaknesses: string[];
  weaknessesAr: string[];
  actionItems: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    titleAr: string;
    detail: string;
    detailAr: string;
  }>;
  benchmarkComparison: {
    percentile: number;
    message: string;
    messageAr: string;
  };
  nextSteps: string;
  nextStepsAr: string;
  questionBreakdown: ResponseSummary[];
  generatedAt: string;
};

function collectTop(items: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const i of items) {
    const key = i.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
    .slice(0, limit);
}

export async function generateFinalReport(params: {
  role: string;
  level: string;
  language: string;
  responses: ResponseSummary[];
  strengthHints?: string[];
  weaknessHints?: string[];
}): Promise<FinalReport> {
  const scores = params.responses
    .map((r) => r.overallScore)
    .filter((s): s is number => typeof s === 'number');
  const overallScore = averageScores(scores);
  const grade = scoreToGrade(overallScore);
  const band = scoreBandLabel(overallScore);

  const strengthHints = collectTop(params.strengthHints ?? [], 3);
  const weaknessHints = collectTop(params.weaknessHints ?? [], 2);

  // Optional LLM polish via a lightweight evaluate call on aggregated text
  let summary =
    overallScore >= 8
      ? `Strong performance for a ${params.level} ${params.role} mock interview. You communicated with clarity and supported claims with relevant examples.`
      : overallScore >= 6
        ? `Solid foundation for a ${params.level} ${params.role} interview. Focus on tighter structure and quantified outcomes to move into the top band.`
        : `This practice session reveals clear growth opportunities for a ${params.level} ${params.role} interview. Prioritize structured storytelling and concrete evidence.`;

  let summaryAr =
    overallScore >= 8
      ? `أداء قوي لمقابلة تجريبية بمستوى ${params.level} لدور ${params.role}. تواصلك واضح ودعمت نقاطك بأمثلة ملائمة.`
      : overallScore >= 6
        ? `أساس متين لمقابلة بمستوى ${params.level} لدور ${params.role}. ركّز على هيكل أوضح ونتائج قابلة للقياس للوصول إلى المستوى الأعلى.`
        : `تكشف هذه الجلسة فرص نمو واضحة لمقابلة بمستوى ${params.level} لدور ${params.role}. أعطِ أولوية للسرد المنظّم والأدلة الملموسة.`;

  try {
    const polish = await evaluateAnswer({
      role: params.role,
      level: params.level,
      round: 'full_mock',
      language: params.language,
      question: 'Generate a final interview summary based on the candidate answers.',
      questionType: 'behavioral',
      timeLimit: 0,
      timeTaken: 0,
      answer: params.responses
        .map(
          (r, i) =>
            `Q${i + 1}: ${r.questionText}\nA: ${r.userAnswer}\nScore: ${r.overallScore ?? 'n/a'}`,
        )
        .join('\n\n'),
    });
    if (polish.feedbackText?.length > 40) {
      summary = polish.feedbackText;
      summaryAr = polish.feedbackTextAr || summaryAr;
    }
  } catch {
    // keep heuristic summary
  }

  const strengths =
    strengthHints.length > 0
      ? strengthHints
      : ['Clear communication', 'Relevant examples', 'Professional tone'];
  const strengthsAr = strengths.map((s) => {
    const map: Record<string, string> = {
      'Clear communication': 'تواصل واضح',
      'Relevant examples': 'أمثلة ذات صلة',
      'Professional tone': 'نبرة مهنية',
      'Willingness to elaborate': 'الاستعداد للتوسع',
      Engagement: 'تفاعل جيد',
      'Relevant content': 'محتوى ملائم',
    };
    return map[s] || s;
  });

  const weaknesses =
    weaknessHints.length > 0
      ? weaknessHints
      : ['Needs more structure', 'Could quantify impact'];
  const weaknessesAr = weaknesses.map((w) => {
    const map: Record<string, string> = {
      'Needs more structure': 'يحتاج إلى هيكل أوضح',
      'Could quantify impact': 'يمكن قياس الأثر بشكل أفضل',
      'Thin evidence': 'أدلة غير كافية',
    };
    return map[w] || w;
  });

  const actionItems: FinalReport['actionItems'] = [
    {
      priority: 'high',
      title: 'Master STAR answers',
      titleAr: 'إتقان إجابات STAR',
      detail: 'Practice 5 core stories with Situation, Task, Action, Result and a metric.',
      detailAr: 'تمرّن على ٥ قصص أساسية بإطار الموقف والمهمة والإجراء والنتيجة مع مقياس.',
    },
    {
      priority: 'medium',
      title: 'Add measurable impact',
      titleAr: 'أضف أثراً قابلاً للقياس',
      detail: 'End each answer with a number: %, time, revenue, quality, or users.',
      detailAr: 'اختم كل إجابة برقم: نسبة، وقت، إيراد، جودة، أو مستخدمون.',
    },
    {
      priority: 'low',
      title: 'Browse matching roles',
      titleAr: 'تصفّح أدواراً مناسبة',
      detail: 'Use your Muqabaleh score on the jobs board and apply to aligned openings.',
      detailAr: 'استخدم درجتك على مقابلة في لوحة الوظائف وقدّم للفرص المناسبة.',
    },
  ];

  return {
    overallScore,
    grade,
    summary,
    summaryAr,
    strengths: strengths.slice(0, 3),
    strengthsAr: strengthsAr.slice(0, 3),
    weaknesses: weaknesses.slice(0, 2),
    weaknessesAr: weaknessesAr.slice(0, 2),
    actionItems,
    benchmarkComparison: {
      // Honest score-band only — no invented peer cohort / fake percentile.
      percentile: Math.round(overallScore * 10),
      message: band.message,
      messageAr: band.messageAr,
    },
    nextSteps:
      'Practice again with a new pre-qual, then browse jobs and apply with your improved score.',
    nextStepsAr:
      'تدرّب مجدداً باستبيان تأهيل جديد، ثم تصفّح الوظائف وقدّم بدرجتك المحسّنة.',
    questionBreakdown: params.responses,
    generatedAt: new Date().toISOString(),
  };
}
