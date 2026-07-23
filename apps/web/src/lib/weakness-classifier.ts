import { TOEIC_ERROR_TYPES, type ToeicErrorType } from '@aelearning/exam-profile-toeic';

interface ClassifyInput {
  questionType: string; // 'inference' | 'detail' | 'vocabulary' | 'grammar_trap' | 'paraphrase' | 'main_idea'
  questionText: string;
  passage?: string;
  choices: string[];
  correctAnswer: string;
  userAnswer: string;
  explanation?: string;
}

interface ClassifyResult {
  errorType: ToeicErrorType;
  note: string;
}

// Rule-based classification of a wrong answer into a specific TOEIC
// error_type (architecture principle 5: never just "wrong") — no paid API
// involved, this app runs free. Explanations authored for questions (seeded
// or imported) tend to name the actual trap in plain terms ("participial
// phrase", "fixed collocation", "subject-verb agreement", ...), so keyword
// matching against the question/passage/explanation text is a surprisingly
// reliable first pass. question_type is the fallback signal when no keyword
// hits, since it strongly correlates with a subset of error types.
const KEYWORD_RULES: [RegExp, ToeicErrorType][] = [
  [/participial|participle/, 'participial_phrase_misread'],
  [/relative clause|reduced clause/, 'relative_clause_reduction'],
  [/subject-verb|subject verb|(\bagreement\b)/, 'subject_verb_agreement_trap'],
  [/preposition/, 'preposition_choice'],
  [/collocation/, 'collocation_mismatch'],
  [/word form|part of speech/, 'word_form_confusion'],
  [/near-synonym|synonym/, 'near_synonym_confusion'],
  [/paraphrase|restate|reword/, 'paraphrase_miss'],
  [/\binfer|imply|implie|idiom|suggest/, 'inference_overreach'],
];

const TIME_KEYWORD_PATTERN =
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|deadline|schedule|by \w+ \d|\d{1,2}(:\d{2})?\s?(am|pm)|before|after)\b/;

function fallbackByQuestionType(questionType: string, combinedText: string): ToeicErrorType {
  switch (questionType) {
    case 'paraphrase':
      return 'paraphrase_miss';
    case 'inference':
    case 'main_idea':
      return 'inference_overreach';
    case 'detail':
      return TIME_KEYWORD_PATTERN.test(combinedText) ? 'time_detail_missed' : 'paraphrase_miss';
    case 'vocabulary':
      return 'near_synonym_confusion';
    case 'grammar_trap':
      return 'subject_verb_agreement_trap';
    default:
      return 'paraphrase_miss';
  }
}

/** Choices sharing a long common stem (e.g. "raise"/"raised") signal a word-form trap regardless of question_type. */
function hasWordFormPattern(choices: string[]): boolean {
  for (let i = 0; i < choices.length; i++) {
    for (let j = i + 1; j < choices.length; j++) {
      const a = choices[i].toLowerCase();
      const b = choices[j].toLowerCase();
      let shared = 0;
      while (shared < a.length && shared < b.length && a[shared] === b[shared]) shared++;
      if (shared >= 4 && a !== b) return true;
    }
  }
  return false;
}

export function classifyError(input: ClassifyInput): ClassifyResult {
  const combinedText = `${input.questionText} ${input.passage ?? ''} ${input.explanation ?? ''}`.toLowerCase();

  for (const [pattern, errorType] of KEYWORD_RULES) {
    if (pattern.test(combinedText)) {
      return {
        errorType,
        note: `Matched from question/explanation wording (rule-based, no AI call).`,
      };
    }
  }

  if (hasWordFormPattern(input.choices)) {
    return {
      errorType: 'word_form_confusion',
      note: 'Answer choices share a common stem with different endings — likely a word-form trap (rule-based, no AI call).',
    };
  }

  const errorType = fallbackByQuestionType(input.questionType, combinedText);
  return {
    errorType,
    note: `Defaulted from question_type ("${input.questionType}") — no explicit trap keyword found (rule-based, no AI call).`,
  };
}

// Keep the exported type list reachable for anything validating against it.
export type { ToeicErrorType };
export { TOEIC_ERROR_TYPES };
