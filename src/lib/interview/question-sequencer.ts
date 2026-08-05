import { getPositionType } from './scoring';

export type BankQuestion = {
  id: string;
  questionText: string;
  questionTextAr: string | null;
  questionType: string;
  difficulty: string;
  timeLimitSeconds: number;
  coachingTips: string[];
  followUpQuestions: unknown;
  evaluationRubric: unknown;
  usageCount: number;
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sample<T>(arr: T[], count: number): T[] {
  if (count <= 0) return [];
  return shuffle(arr).slice(0, Math.min(count, arr.length));
}

export function sequenceQuestions(
  questions: BankQuestion[],
  numQuestions: number,
): BankQuestion[] {
  if (!questions.length) return [];
  const pool = shuffle(questions);
  const used = new Set<string>();
  const pick = (pred: (q: BankQuestion) => boolean): BankQuestion | undefined => {
    const hit = pool.find((q) => !used.has(q.id) && pred(q));
    if (hit) used.add(hit.id);
    return hit;
  };

  const sequenced: BankQuestion[] = [];

  const warm = pick(
    (q) =>
      q.difficulty === 'easy' &&
      (q.questionType === 'behavioral' || q.questionType === 'cultural_fit'),
  );
  if (warm) sequenced.push(warm);

  const coreCount = Math.max(1, Math.floor(numQuestions * 0.6));
  const core = sample(
    pool.filter(
      (q) => !used.has(q.id) && (q.difficulty === 'medium' || q.difficulty === 'easy'),
    ),
    coreCount,
  );
  core.forEach((q) => used.add(q.id));
  sequenced.push(...core);

  const deepCount = Math.max(0, Math.floor(numQuestions * 0.25));
  const deep = sample(
    pool.filter(
      (q) =>
        !used.has(q.id) &&
        q.difficulty === 'hard' &&
        ['technical', 'situational', 'case_study'].includes(q.questionType),
    ),
    deepCount,
  );
  deep.forEach((q) => used.add(q.id));
  sequenced.push(...deep);

  const closing = pick(
    (q) => q.questionType === 'cultural_fit' || q.questionType === 'behavioral',
  );
  if (closing) sequenced.push(closing);

  if (sequenced.length < numQuestions) {
    const remaining = sample(
      pool.filter((q) => !used.has(q.id)),
      numQuestions - sequenced.length,
    );
    sequenced.push(...remaining);
  }

  return sequenced.slice(0, numQuestions);
}

export function annotatePositions<T extends { id: string }>(
  questions: T[],
): Array<T & { positionType: ReturnType<typeof getPositionType>; order: number }> {
  return questions.map((q, i) => ({
    ...q,
    order: i + 1,
    positionType: getPositionType(i, questions.length),
  }));
}
