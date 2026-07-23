// TOEIC-specific vocabularies. These constants live here, not in
// packages/vocab-core, because word_tags.skill / .context and
// weakness_logs.error_type are free text at the DB level on purpose —
// each exam profile owns its own meaning for them (architecture principle 3:
// adding IELTS must never require touching vocab-core).

export const TOEIC_SKILLS = ['vocab', 'grammar', 'collocation'] as const;
export type ToeicSkill = (typeof TOEIC_SKILLS)[number];

export const TOEIC_CONTEXTS = [
  'Part 5',
  'Part 6',
  'Part 7',
  'Listening Part 3',
  'Listening Part 4',
  'General Business',
] as const;
export type ToeicContext = (typeof TOEIC_CONTEXTS)[number];

export const TOEIC_QUESTION_TYPES = [
  'inference',
  'detail',
  'vocabulary',
  'grammar_trap',
  'paraphrase',
  'main_idea',
] as const;
export type ToeicQuestionType = (typeof TOEIC_QUESTION_TYPES)[number];

// Error types high-band learners actually trip on — this is the vocabulary
// the Weakness Map aggregates over for TOEIC. Deliberately specific, never
// just "wrong"/"Part 5" (architecture principle 5).
export const TOEIC_ERROR_TYPES = [
  'near_synonym_confusion',
  'collocation_mismatch',
  'paraphrase_miss',
  'inference_overreach',
  'subject_verb_agreement_trap',
  'relative_clause_reduction',
  'participial_phrase_misread',
  'preposition_choice',
  'word_form_confusion',
  'time_detail_missed',
] as const;
export type ToeicErrorType = (typeof TOEIC_ERROR_TYPES)[number];

export interface ToeicWordSeed {
  term: string;
  ipa: string;
  meanings: { pos: string; definition: string; translation?: string }[];
  examples: { sentence: string; translation?: string }[];
  skill: ToeicSkill;
  context: ToeicContext;
  difficultyForExam: number; // 1 (easy trap) – 5 (hardest near-synonym/collocation trap)
}

export interface ToeicQuestionSeed {
  part: string;
  questionType: ToeicQuestionType;
  content: {
    passage?: string;
    audioTranscript?: string;
    questionText: string;
    choices: string[];
  };
  correctAnswer: string;
  explanation: string;
  source: string;
  difficultyForExam: number;
}
