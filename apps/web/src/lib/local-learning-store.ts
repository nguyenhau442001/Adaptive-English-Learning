import { applySrsGrade, initialSrsState, type SrsGrade } from '@aelearning/vocab-core';

export type LocalVocabProgress = {
  wordId: string;
  knownAtOnboarding: boolean;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
};

export type LocalWeaknessLog = {
  id: string;
  errorType: string;
  skill: 'listening' | 'reading';
  note: string;
  createdAt: string;
};

const VOCAB_KEY = 'vu-dai-vocab-progress';
const WEAKNESS_KEY = 'vu-dai-weakness-logs';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value));
}

export function wordId(term: string) {
  return term.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getVocabProgress(): Record<string, LocalVocabProgress> {
  return readJson<Record<string, LocalVocabProgress>>(VOCAB_KEY, {});
}

export function saveOnboardingProgress(knownIds: string[], unsureIds: string[]) {
  const current = getVocabProgress();
  const now = new Date().toISOString();

  for (const id of knownIds) {
    current[id] = {
      wordId: id,
      knownAtOnboarding: true,
      ...initialSrsState(),
      lastReviewedAt: null,
      nextReviewAt: null,
    };
  }

  for (const id of unsureIds) {
    const previous = current[id];
    current[id] = previous && !previous.knownAtOnboarding
      ? previous
      : {
          wordId: id,
          knownAtOnboarding: false,
          ...initialSrsState(),
          lastReviewedAt: null,
          nextReviewAt: now,
        };
  }

  writeJson(VOCAB_KEY, current);
}

export function gradeVocabulary(id: string, grade: SrsGrade) {
  const progress = getVocabProgress();
  const previous = progress[id];
  const result = applySrsGrade(
    previous ?? { ...initialSrsState(), wordId: id, knownAtOnboarding: false, lastReviewedAt: null, nextReviewAt: new Date().toISOString() },
    grade,
  );

  progress[id] = {
    wordId: id,
    knownAtOnboarding: false,
    intervalDays: result.intervalDays,
    easeFactor: result.easeFactor,
    repetitions: result.repetitions,
    lapses: result.lapses,
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: result.nextReviewAt.toISOString(),
  };
  writeJson(VOCAB_KEY, progress);
  return progress[id];
}

export function addWeaknessLog(log: Omit<LocalWeaknessLog, 'id' | 'createdAt'>) {
  const logs = getWeaknessLogs();
  logs.unshift({
    ...log,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  });
  writeJson(WEAKNESS_KEY, logs.slice(0, 500));
}

export function getWeaknessLogs(): LocalWeaknessLog[] {
  return readJson<LocalWeaknessLog[]>(WEAKNESS_KEY, []);
}
