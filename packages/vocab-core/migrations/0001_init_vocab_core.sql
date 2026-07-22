-- 0001_init_vocab_core.sql
-- Vocab Core schema: exam_profiles, words, word_tags, user_progress.
--
-- Architecture principles this schema enforces:
--   1. No linear curriculum. SRS only queues words the user actually got wrong.
--   2. Word (exam-agnostic) is separated from WordTag (exam-specific linkage).
--   3. Adding a new exam (e.g. IELTS) = inserting a new exam_profiles row +
--      importing word_tags content. It must never require altering the
--      words, word_tags, or user_progress table definitions.
--   4. UserProgress (SRS state) is scoped per exam_id — mastery in TOEIC
--      does not imply mastery in IELTS for the same word.

-- gen_random_uuid() is built into Postgres 13+ (what Supabase runs) and does
-- NOT require pgcrypto. moddatetime supplies the updated_at trigger helper below.
create extension if not exists moddatetime schema extensions;

-- ============================================================================
-- exam_profiles
-- ============================================================================
-- A real table (not an enum) so that adding IELTS later is a data insert,
-- not a schema migration. Every exam-scoped table below FKs to this instead
-- of hardcoding exam identifiers.
create table exam_profiles (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,        -- stable machine key, e.g. 'toeic', 'ielts'
  name        text not null,               -- display name, e.g. 'TOEIC'
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table exam_profiles is
  'Registry of supported exams. Adding a new exam is an INSERT here, never a schema change to words/word_tags/user_progress.';

-- ============================================================================
-- words
-- ============================================================================
-- Exam-agnostic vocabulary. Holds only what is true about a word regardless
-- of which exam it's being studied for. Never gains exam-specific columns —
-- exam-specific data belongs on word_tags.
create table words (
  id             uuid primary key default gen_random_uuid(),
  term           text not null,                 -- the headword, e.g. 'accommodate'
  ipa             text,                          -- pronunciation, e.g. '/əˈkɒmədeɪt/'
  meanings        jsonb not null default '[]',   -- [{ pos, definition, translation? }, ...]
  examples        jsonb not null default '[]',   -- [{ sentence, translation? }, ...]
  audio_url       text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table words is
  'Exam-agnostic word dictionary. Shared across all exam profiles. Must never contain exam-specific fields (difficulty, skill, context) — those live in word_tags.';
comment on column words.meanings is
  'jsonb array rather than a separate table: meanings are read as a unit with the word (no independent querying/filtering needed), so this avoids a join for the most common read path.';

-- Prevent literal duplicate headwords from silently proliferating; term
-- variants (e.g. "accommodate" vs "accommodation") are still separate rows,
-- this only guards exact-string duplicates.
create unique index words_term_key on words (lower(term));

create trigger words_set_updated_at
  before update on words
  for each row
  execute function extensions.moddatetime(updated_at);

-- ============================================================================
-- word_tags
-- ============================================================================
-- The join between a Word and an ExamProfile: what role this word plays in
-- a specific exam. This is where all exam-specific metadata lives, so new
-- exams never require touching the words table.
create table word_tags (
  id                  uuid primary key default gen_random_uuid(),
  word_id             uuid not null references words(id) on delete cascade,
  exam_id             uuid not null references exam_profiles(id) on delete cascade,
  skill               text not null,   -- 'vocab' | 'grammar' | 'collocation' (validated at app/exam-profile level, not DB enum — different exams may add skills without a migration)
  context             text,            -- free-form exam-specific placement, e.g. 'Part 5', 'Writing Task 2'
  difficulty_for_exam smallint,        -- exam-local difficulty; NOT a shared CEFR scale. Each exam-profiles package defines its own meaning for this number (e.g. TOEIC might use 1-5 per Part, IELTS a different range). No CHECK range constraint here on purpose, so exam profiles aren't forced onto a shared scale.
  created_at          timestamptz not null default now(),

  -- A word can carry multiple tags per exam (e.g. same word tested as both
  -- vocab and collocation), but not the identical (word, exam, skill, context)
  -- combination twice.
  unique (word_id, exam_id, skill, context)
);

comment on table word_tags is
  'Exam-specific linkage between a word and an exam profile. All exam-specific metadata (skill, context, difficulty) lives here so words and user_progress stay exam-agnostic / exam-scoped respectively without schema changes per new exam.';
comment on column word_tags.difficulty_for_exam is
  'Deliberately not a shared CEFR-style scale. Difficulty is only meaningful within one exam''s own grading, decided by that exam-profile package, not by vocab-core.';

create index word_tags_word_id_idx on word_tags (word_id);
create index word_tags_exam_id_idx on word_tags (exam_id);

-- ============================================================================
-- user_progress
-- ============================================================================
-- SRS state. Scoped per (user_id, word_id, exam_id) — deliberately NOT a
-- global per-word mastery record. A user can have mastered a word's TOEIC
-- Part 5 usage while still being weak on it in an IELTS Writing context.
-- Splitting by exam_id also means adding IELTS never requires migrating or
-- resetting existing TOEIC SRS state.
create table user_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  word_id          uuid not null references words(id) on delete cascade,
  exam_id          uuid not null references exam_profiles(id) on delete cascade,

  -- Onboarding "quick scan" gate: a word only enters real SRS scheduling
  -- once the user has marked it "not sure" during onboarding (or missed it
  -- in review). Words marked "already known" at onboarding get is_known_at_onboarding
  -- = true and next_review_at left null, so they never surface in the SRS
  -- queue unless/until the user actually gets them wrong later.
  is_known_at_onboarding boolean not null default false,

  -- Core SRS state (SM-2-style; interval_days/ease_factor are generic
  -- enough to support swapping the scheduling algorithm later without a
  -- schema change).
  interval_days    integer not null default 0,
  ease_factor      numeric(4,2) not null default 2.5,
  repetitions      integer not null default 0,
  lapses           integer not null default 0,          -- count of times user got this wrong after having "learned" it
  last_reviewed_at timestamptz,
  next_review_at   timestamptz,                          -- null = not yet in the SRS queue (e.g. known at onboarding, never missed)

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- One SRS state per user per word per exam — this is the field that
  -- enforces "mastery is per-exam, not global".
  unique (user_id, word_id, exam_id)
);

comment on table user_progress is
  'SRS scheduling state, scoped per (user, word, exam). Deliberately not deduplicated across exams: the same word has independent mastery state per exam_id, so TOEIC progress never leaks into or blocks IELTS progress for the same word.';
comment on column user_progress.exam_id is
  'This is the crux of the exam-agnostic-core principle: without exam_id in the uniqueness key, a word could only ever have one global mastery state, making it impossible to add IELTS without corrupting or sharing TOEIC SRS history.';
comment on column user_progress.next_review_at is
  'Null means the word is outside the active SRS queue entirely (e.g. marked known at onboarding). This keeps the "no forced lessons" principle enforceable with a simple WHERE next_review_at IS NOT NULL rather than a separate status flag.';

-- Primary access pattern this schema is optimized for: "give me the words
-- this user needs to review today, for their currently active exam."
-- Partial index (next_review_at IS NOT NULL) excludes onboarding-known words
-- that never entered the queue, keeping the index small and the common
-- query ("due" rows) fast.
create index user_progress_due_queue_idx
  on user_progress (user_id, exam_id, next_review_at)
  where next_review_at is not null;

create trigger user_progress_set_updated_at
  before update on user_progress
  for each row
  execute function extensions.moddatetime(updated_at);
