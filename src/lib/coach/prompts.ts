import type { PrepSelections } from './types';
import { getInterviewConfig, getRoleById } from './config';

function labelFor(
  list: { id: string; en: string; ar?: string }[],
  id: string,
  preferAr = false,
): string {
  const hit = list.find((x) => x.id === id);
  if (!hit) return id;
  if (preferAr && hit.ar) return hit.ar;
  return hit.en;
}

export function resolveCoachName(coachGender: PrepSelections['coachGender']): string {
  const cfg = getInterviewConfig();
  if (coachGender === 'male') return cfg.coaches.male.name;
  return cfg.coaches.female.name; // female + no preference → Jeannie
}

export function buildCoachSystemPrompt(
  prep: PrepSelections,
  candidateName: string,
): string {
  const cfg = getInterviewConfig();
  const roleMeta = getRoleById(prep.role);
  const preferAr = prep.language === 'ar' || prep.language === 'mixed';
  const role = labelFor(cfg.roles, prep.role, preferAr);
  const industry = labelFor(cfg.industries, prep.industry, preferAr);
  const seniority = labelFor(cfg.seniority, prep.seniority, preferAr);
  const language = labelFor(cfg.languages, prep.language, preferAr);
  const coachName = resolveCoachName(prep.coachGender);
  const company =
    prep.companyName?.trim() ||
    `a company in the ${industry} sector`;
  const focus =
    (preferAr ? roleMeta?.questionFocus?.ar : roleMeta?.questionFocus?.en) ||
    roleMeta?.questionFocus?.en ||
    '';
  const rubric =
    (preferAr ? roleMeta?.rubric?.ar : roleMeta?.rubric?.en) ||
    roleMeta?.rubric?.en ||
    '';

  const languageRule =
    prep.language === 'ar'
      ? 'Conduct the ENTIRE interview in Arabic with correct grammar and natural MENA professional tone.'
      : prep.language === 'mixed'
        ? "Ask questions in Arabic. Accept answers in Arabic or English and respond in the candidate's language."
        : 'Conduct the interview in clear professional English.';

  return `You are ${coachName}, a professional interview coach for muqabaleh.com.
Candidate: ${candidateName}
Role: ${role}
Industry: ${industry}
Seniority: ${seniority}
Language: ${language}
Company: ${company}

Role question bank focus:
${focus}

Role scoring rubric guidance:
${rubric}

${languageRule}
Conduct a realistic ${seniority} ${role} interview.
Ask 5 to 7 questions total, tailored to this role's question bank focus.
After each answer, give 1-2 sentences of brief feedback before the next question.
If the answer is vague, ask for a specific example with numbers or outcomes.
If the answer is strong, raise the difficulty slightly.
If the user switches language mid-interview, match their language immediately.
Apply MENA professional cultural norms: respect hierarchy, frame feedback diplomatically in Arabic, be direct in English.
End the interview after 5-7 questions or if the user says they want to stop.

When the interview is complete, end with a clear closing that includes the exact token [[INTERVIEW_COMPLETE]] on its own line.`;
}

export function buildScoringPrompt(
  prep: PrepSelections,
  transcript: string,
): { system: string; user: string } {
  const cfg = getInterviewConfig();
  const roleMeta = getRoleById(prep.role);
  const role = labelFor(cfg.roles, prep.role);
  const seniority = labelFor(cfg.seniority, prep.seniority);
  const rubric = roleMeta?.rubric?.en || '';
  const competencies = cfg.competencies.length
    ? cfg.competencies
    : [
        'Communication',
        'Technical Depth',
        'Problem Solving',
        'Cultural Fit',
        'Confidence',
        'Leadership',
      ];

  const system = `You are an interview evaluator for muqabaleh.com. Return ONLY valid JSON. No markdown, no explanation.`;
  const user = `Evaluate this interview transcript for a ${role} position at ${seniority} level.
Role rubric: ${rubric}
Score each competency from 0 to 100.
Return ONLY valid JSON. No markdown, no explanation.

{
  "overallScore": number,
  "grade": "A" | "B+" | "B" | "C" | "D",
  "competencyBreakdown": [
${competencies.map((c) => `    { "name": "${c}", "score": number }`).join(',\n')}
  ],
  "strengths": [string, string, string],
  "improvements": [string, string, string],
  "recommendedNextSteps": string
}

TRANSCRIPT:
${transcript}`;

  return { system, user };
}
