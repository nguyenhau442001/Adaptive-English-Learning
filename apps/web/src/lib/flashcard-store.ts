// HSK-style flashcard progress: a plain binary status per word (known /
// unknown / unseen), stored locally. Deliberately separate from the SM-2
// engine in @aelearning/vocab-core and the /onboarding flow — this store
// powers the fast "flashcard" trainer where a learner
// cramming for a 900+ TOEIC just wants term -> meaning reps, not interval
// scheduling.

export type FlashcardStatus = 'known' | 'unknown';

export interface FlashcardState {
  /** wordId -> last self-assessment. Absence means "unseen". */
  status: Record<string, FlashcardStatus>;
  /** Per-deck shuffled index order, so shuffle survives reloads. */
  order: Record<string, number[]>;
  prefs: {
    hideMeaning: boolean;
    lastDeck: string | null;
    exampleSpeechRate: number;
  };
  /** ISO date (yyyy-mm-dd) -> unique wordIds studied that day. Drives streak. */
  daily: Record<string, string[]>;
}

const KEY = 'vu-dai-toeic-flashcards';

const DEFAULT_STATE: FlashcardState = {
  status: {},
  order: {},
  prefs: { hideMeaning: false, lastDeck: null, exampleSpeechRate: 1 },
  daily: {},
};

export const EXAMPLE_SPEECH_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export function wordId(term: string): string {
  return term.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function read(): FlashcardState {
  if (typeof window === 'undefined') return structuredClone(DEFAULT_STATE);
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return structuredClone(DEFAULT_STATE);
  try {
    const parsed = JSON.parse(raw) as Partial<FlashcardState>;
    return {
      status: parsed.status ?? {},
      order: parsed.order ?? {},
      prefs: { ...DEFAULT_STATE.prefs, ...parsed.prefs },
      daily: parsed.daily ?? {},
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function write(state: FlashcardState): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function getFlashcardState(): FlashcardState {
  return read();
}

function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Records one word as studied today; used by the returning-visitor streak. */
function recordDailyStudy(state: FlashcardState, id: string): void {
  const key = todayKey();
  const seen = new Set(state.daily[key] ?? []);
  seen.add(id);
  state.daily[key] = [...seen];
}

export function setStatus(id: string, status: FlashcardStatus): FlashcardState {
  const state = read();
  state.status[id] = status;
  recordDailyStudy(state, id);
  write(state);
  return state;
}

export function markKnown(id: string): FlashcardState {
  return setStatus(id, 'known');
}

export function markUnknown(id: string): FlashcardState {
  return setStatus(id, 'unknown');
}

/** Clears status for the given wordIds only (one deck's "học lại từ đầu"). */
export function resetDeck(ids: string[]): FlashcardState {
  const state = read();
  for (const id of ids) delete state.status[id];
  write(state);
  return state;
}

export function setPref<K extends keyof FlashcardState['prefs']>(
  key: K,
  value: FlashcardState['prefs'][K],
): FlashcardState {
  const state = read();
  state.prefs[key] = value;
  write(state);
  return state;
}

/** Persists a shuffled index order for a deck. */
export function saveDeckOrder(deck: string, order: number[]): FlashcardState {
  const state = read();
  state.order[deck] = order;
  state.prefs.lastDeck = deck;
  write(state);
  return state;
}

export type DeckCounts = {
  total: number;
  known: number;
  unknown: number;
  unseen: number;
};

/** Tallies a deck's word list against the stored status map. */
export function countDeck(ids: string[], state: FlashcardState = read()): DeckCounts {
  let known = 0;
  let unknown = 0;
  for (const id of ids) {
    const s = state.status[id];
    if (s === 'known') known += 1;
    else if (s === 'unknown') unknown += 1;
  }
  return { total: ids.length, known, unknown, unseen: ids.length - known - unknown };
}

export type StatusFilter = 'all' | 'unseen' | 'unknown' | 'known';

/** Returns the subset of ids matching a status filter, order preserved. */
export function filterByStatus(
  ids: string[],
  filter: StatusFilter,
  state: FlashcardState = read(),
): string[] {
  if (filter === 'all') return ids.slice();
  if (filter === 'unseen') return ids.filter((id) => !state.status[id]);
  return ids.filter((id) => state.status[id] === filter);
}

/** Consecutive-day study streak ending today (or yesterday, still counts). */
export function getStreak(state: FlashcardState = read()): number {
  const days = new Set(Object.keys(state.daily).filter((d) => (state.daily[d]?.length ?? 0) > 0));
  if (days.size === 0) return 0;
  const cursor = new Date();
  if (!days.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Fisher-Yates; returns a new array. */
export function shuffled<T>(items: T[]): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
