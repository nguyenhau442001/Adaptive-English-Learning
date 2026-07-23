// Mirrors packages/vocab-core/migrations/0001_init_vocab_core.sql and
// 0002_practice_and_weakness.sql. Kept exam-agnostic on purpose: nothing in
// this file may reference a specific exam (no 'toeic'/'ielts' literals).

export interface Meaning {
  pos: string; // part of speech, e.g. 'v.', 'n.', 'adj.'
  definition: string;
  translation?: string;
}

export interface ExampleSentence {
  sentence: string;
  translation?: string;
}

export interface Word {
  id: string;
  term: string;
  ipa: string | null;
  meanings: Meaning[];
  examples: ExampleSentence[];
  audioUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExamProfile {
  id: string;
  code: string; // 'toeic' | 'ielts' | ...
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface WordTag {
  id: string;
  wordId: string;
  examId: string;
  skill: string; // 'vocab' | 'grammar' | 'collocation' | ... (exam-profile defined)
  context: string | null; // e.g. 'Part 5'
  difficultyForExam: number | null; // exam-local scale only, never CEFR
  createdAt: string;
}

export type ProgressStatus = 'new' | 'learning' | 'known' | 'suspended';

export interface UserProgress {
  id: string;
  userId: string;
  wordId: string;
  examId: string;
  isKnownAtOnboarding: boolean;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Derives a coarse UI status from raw SRS fields (status is not itself a stored column). */
export function deriveProgressStatus(p: Pick<UserProgress, 'isKnownAtOnboarding' | 'nextReviewAt' | 'repetitions' | 'lapses'>): ProgressStatus {
  if (p.isKnownAtOnboarding && p.nextReviewAt === null) return 'known';
  if (p.nextReviewAt === null) return 'new';
  if (p.repetitions >= 2 && p.lapses === 0) return 'known';
  return 'learning';
}
