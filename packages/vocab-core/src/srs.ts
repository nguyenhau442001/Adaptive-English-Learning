// SM-2 spaced-repetition scheduler. Deliberately exam-agnostic: it only
// operates on generic interval/ease/repetition fields, never anything
// exam-specific. Adding IELTS must never require touching this file
// (architecture principle #3) — exam-specific behavior belongs in
// packages/exam-profiles/*, not here.

export type SrsGrade = 'again' | 'hard' | 'good' | 'easy';

export interface SrsState {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
}

export interface SrsResult extends SrsState {
  nextReviewAt: Date;
}

// SM-2 quality mapping. 'again' is a lapse (quality < 3): resets
// repetitions and grows lapses, but does NOT reset ease_factor to the
// floor — a single miss on an otherwise-easy word shouldn't nuke its
// history, it just re-enters short-interval relearning.
const GRADE_QUALITY: Record<SrsGrade, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

const MIN_EASE_FACTOR = 1.3;

/**
 * Applies one SM-2 review step to the given state and returns the updated
 * state plus the next review timestamp.
 *
 * @param now Injected for deterministic testing; defaults to current time.
 */
export function applySrsGrade(state: SrsState, grade: SrsGrade, now: Date = new Date()): SrsResult {
  const quality = GRADE_QUALITY[grade];

  // Standard SM-2 ease-factor update, clamped to a floor so a streak of
  // hard/again answers can't push a word into an unrecoverable near-zero
  // ease that would make intervals effectively never grow again.
  const easeFactor = Math.max(
    MIN_EASE_FACTOR,
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  if (quality < 3) {
    // Lapse: back to the start of the learning ladder, but keep the
    // (possibly still-high) ease factor computed above and record the
    // lapse count for weakness/history tracking.
    const intervalDays = 0; // due again same day (next session)
    return {
      intervalDays,
      easeFactor,
      repetitions: 0,
      lapses: state.lapses + 1,
      nextReviewAt: addDays(now, intervalDays === 0 ? 0 : intervalDays),
    };
  }

  const repetitions = state.repetitions + 1;
  let intervalDays: number;
  if (repetitions === 1) {
    intervalDays = 1;
  } else if (repetitions === 2) {
    intervalDays = 6;
  } else {
    intervalDays = Math.round(state.intervalDays * easeFactor);
  }

  // 'hard' still passes (quality 3) but should grow the interval more
  // conservatively than 'good'/'easy' — SM-2 proper doesn't distinguish
  // this, but a flat multiplier keeps "Hard" meaningfully different from
  // "Good" in the UI instead of being a no-op label.
  if (grade === 'hard') {
    intervalDays = Math.max(1, Math.round(intervalDays * 0.7));
  } else if (grade === 'easy') {
    intervalDays = Math.round(intervalDays * 1.3);
  }

  return {
    intervalDays,
    easeFactor,
    repetitions,
    lapses: state.lapses,
    nextReviewAt: addDays(now, intervalDays),
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  if (days === 0) {
    // "Due again" lapses stay due immediately (same session), not +0 days
    // from midnight boundary weirdness.
    return result;
  }
  result.setDate(result.getDate() + days);
  return result;
}

/** Initial state for a word freshly entering the SRS queue (never onboarding-known). */
export function initialSrsState(): SrsState {
  return { intervalDays: 0, easeFactor: 2.5, repetitions: 0, lapses: 0 };
}
