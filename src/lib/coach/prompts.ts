import type { PrepSelections } from './types';
import { getInterviewConfig } from './config';

function labelFor(
  list: { id: string; en: string }[],
  id: string,
): string {
  return list.find((x) => x.id === id)?.en || id;
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
  const role = labelFor(cfg.roles, prep.role);
  const industry = labelFor(cfg.industries, prep.industry);
  const seniority = labelFor(cfg.seniority, prep.seniority);
  const language = labelFor(cfg.languages, prep.language);
  const coachName = resolveCoachName(prep.coachGender);
  const company =
    prep.companyName?.trim() ||
    `a company in the ${industry} sector`;

  return `You are ${coachName}, a professional interview coach for muqabaleh.com.
Candidate: ${candidateName}
Role: ${role}
Industry: ${industry}
Seniority: ${seniority}
Language: ${language}
Company: ${company}

Conduct a realistic ${seniority} ${role} interview in ${language}.
Ask 5 to 7 questions total.
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
  const role = labelFor(cfg.roles, prep.role);
  const seniority = labelFor(cfg.seniority, prep.seniority);

  const system = `You are an interview evaluator for muqabaleh.com. Return ONLY valid JSON. No markdown, no explanation.`;
  const user = `Evaluate this interview transcript for a ${role} position at ${seniority} level.
Score each competency from 0 to 100.
Return ONLY valid JSON. No markdown, no explanation.

{
  "overallScore": number,
  "grade": "A" | "B+" | "B" | "C" | "D",
  "competencyBreakdown": [
    { "name": "Communication", "score": number },
    { "name": "Technical Depth", "score": number },
    { "name": "Problem Solving", "score": number },
    { "name": "Cultural Fit", "score": number },
    { "name": "Confidence", "score": number }
  ],
  "strengths": [string, string, string],
  "improvements": [string, string, string],
  "recommendedNextSteps": string
}

TRANSCRIPT:
${transcript}`;

  return { system, user };
}
