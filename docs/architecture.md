# Architecture

Five non-negotiable principles. Each is enforced in the schema itself (see
`packages/vocab-core/migrations/`), not just in application code, so violating one requires a
schema change — which should be the signal to stop and reconsider, not work around.

## 1. `Word` is exam-agnostic; `WordTag` is exam-specific

`words` holds only what's true about a word regardless of exam (term, meanings, pronunciation,
examples). Anything specific to how an exam tests that word — `skill`, `context`,
`difficulty_for_exam` — lives on `word_tags`, a join table between a word and an `exam_profiles`
row. `difficulty_for_exam` is deliberately **not** a shared CEFR-style scale; each exam profile
package defines its own meaning for the number.

Why: a word's TOEIC Part 5 difficulty and its IELTS Writing Task 2 register are different axes
entirely. Forcing them onto one shared scale would make either exam's data meaningless for the
other.

## 2. `UserProgress` (SRS state) is scoped per `(user_id, word_id, exam_id)`

Not deduplicated across exams. A user can have mastered a word's TOEIC usage while still being
weak on it in an IELTS Writing context — these are independent facts.

Why: without `exam_id` in the uniqueness key, a word could only ever have one global mastery
state. Adding IELTS would then either corrupt existing TOEIC SRS history or require sharing it,
neither of which is correct.

## 3. Adding an exam = adding an `ExamProfile` + data, never a schema/engine change

`exam_profiles` is a real table, not an enum — adding IELTS is an `INSERT`, not a migration.
`packages/vocab-core` (the SM-2 engine and core schema) never gains exam-specific knowledge; all
of that lives in `packages/exam-profiles/<exam>/`, including that exam's own skill/context/
error_type vocabularies.

Why: this is what makes "add IELTS later" actually true instead of aspirational. If adding an exam
ever requires touching `vocab-core` or the `words`/`user_progress` table definitions, this
principle has been violated.

## 4. Onboarding bulk-marks "already known"; only "not sure" enters SRS

The onboarding quick scan lets a user mark a word "known" (sets `is_known_at_onboarding = true`,
`next_review_at` stays `null` — it never enters the SRS queue) or "not sure" (enters the queue
immediately). Nothing is scheduled by default, there's no forced daily quota, and there's no
streak-shaming copy anywhere in the UI.

Why: the target user is band 850+, not a beginner. A linear, Duolingo-style forced curriculum
would waste their time reviewing words they already know and would frame lapses as failures
instead of just data.

## 5. Errors are tagged by specific `error_type`, not just Part/pass-fail

Every wrong answer (Listening/Reading) or graded weak spot gets a specific `error_type` —
`near_synonym_confusion`, `paraphrase_miss`, `subject_verb_agreement_trap`, etc., not just "wrong"
or "Part 5". This is what the Weakness Map aggregates over. `error_type` is free text (validated
per exam-profile package, not a DB enum) so new trap categories never require a migration.

Why: at a high band, the problem is subtle traps (near-synonyms, collocations, paraphrase,
grammar traps), not missing fundamentals. A bare accuracy score can't tell the user *which* trap
keeps costing them points; a specific, aggregable `error_type` can.
