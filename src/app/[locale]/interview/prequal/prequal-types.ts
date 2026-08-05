export type PrequalFormState = {
  targetRole: string;
  seniorityLevel: string;
  questionTypes: string[];
  interviewRound: string;
  languagePreference: string;
  targetIndustry: string | null;
  weaknessFocus: string | null;
  durationPreset: string;
};

export const EMPTY_PREQUAL: PrequalFormState = {
  targetRole: '',
  seniorityLevel: '',
  questionTypes: [],
  interviewRound: '',
  languagePreference: '',
  targetIndustry: null,
  weaknessFocus: null,
  durationPreset: '',
};
