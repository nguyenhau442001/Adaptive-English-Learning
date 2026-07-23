-- 0002_practice_and_weakness.sql
-- Practice content + performance tracking: questions, weakness_logs,
-- speaking_attempts, writing_attempts.
--
-- Same architecture principles as 0001:
--   - questions is scoped by exam_id, never assumes a single exam's part
--     structure (part/question_type are free text, validated at the
--     exam-profile package level, not via DB enum).
--   - weakness_logs tags errors by error_type (specific failure mode),
--     never just "wrong" or "Part 5" — this is what makes the Weakness Map
--     possible instead of a bare score.

-- ============================================================================
-- questions
-- ============================================================================
-- Real exam content (Listening/Reading), sourced from ETS-style "đề cam"
-- material. exam_id-scoped so IELTS content later is purely additive rows.
create table questions (
  id                  uuid primary key default gen_random_uuid(),
  exam_id             uuid not null references exam_profiles(id) on delete cascade,
  part                text not null,   -- exam-specific placement, e.g. 'Part 5', 'Part 7'
  question_type       text not null,   -- 'inference' | 'detail' | 'vocabulary' | 'grammar_trap' | 'paraphrase' | ... (exam-profile defined, no DB enum so new types don't need a migration)
  content              jsonb not null, -- { passage?, audio_transcript?, question_text, choices: [...] }
  correct_answer      text not null,
  explanation         text,
  audio_url           text,
  source               text,           -- e.g. 'ETS 2024 Test 1', for provenance/licensing tracking
  difficulty_for_exam smallint,        -- exam-local difficulty, same convention as word_tags.difficulty_for_exam
  created_at           timestamptz not null default now()
);

comment on table questions is
  'Real exam questions (Listening/Reading), scoped per exam_id. question_type favors inference/paraphrase/grammar_trap style tagging so high-band users can drill the specific trap categories that actually trip them up.';

create index questions_exam_id_idx on questions (exam_id);
create index questions_exam_part_type_idx on questions (exam_id, part, question_type);

-- ============================================================================
-- weakness_logs
-- ============================================================================
-- Every miss (or graded weak spot) gets tagged with a specific error_type,
-- not just "wrong" — this is the data source for the Weakness Map dashboard.
create table weakness_logs (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  exam_id               uuid not null references exam_profiles(id) on delete cascade,
  skill                 text not null,   -- 'listening' | 'reading' | 'speaking' | 'writing' | 'vocab' | 'grammar'
  error_type            text not null,   -- specific failure mode, e.g. 'collocation_confusion', 'paraphrase_miss', 'subject_verb_agreement_trap'
  related_question_id   uuid references questions(id) on delete set null,
  related_word_id       uuid references words(id) on delete set null,
  note                  text,            -- optional free-text detail (e.g. AI classifier's short rationale)
  created_at            timestamptz not null default now()
);

comment on table weakness_logs is
  'One row per diagnosed mistake, tagged by specific error_type rather than just pass/fail or Part number. Aggregating this table (by error_type, over 7/30-day windows) is what powers the Weakness Map, replacing a bare score with a pattern of *why* the user is missing points.';
comment on column weakness_logs.error_type is
  'Specific failure category (e.g. "near_synonym_confusion", "inference_overreach"), not a generic correct/incorrect flag. Free text, defined per exam-profile package/classifier prompt, not a DB enum, so new trap categories never require a migration.';

create index weakness_logs_user_exam_idx on weakness_logs (user_id, exam_id);
create index weakness_logs_error_type_idx on weakness_logs (user_id, exam_id, error_type);
create index weakness_logs_created_at_idx on weakness_logs (user_id, created_at desc);

-- ============================================================================
-- speaking_attempts
-- ============================================================================
create table speaking_attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  exam_id        uuid not null references exam_profiles(id) on delete cascade,
  task_type      text not null,   -- ETS task type, e.g. 'read_aloud' | 'describe_picture' | 'respond_questions'
  audio_url      text,
  transcript     text,
  -- Six ETS-style rubric criteria scored independently rather than one
  -- overall number, so feedback can point at *which* criterion is weak.
  rubric_scores  jsonb not null default '{}', -- { pronunciation, intonation, grammar, vocabulary, cohesion, relevance }
  ai_feedback    text,
  created_at     timestamptz not null default now()
);

comment on table speaking_attempts is
  'One row per speaking practice attempt. rubric_scores holds the 6 ETS-style criteria independently (not a single blended score) so ai_feedback can be specific about which criterion needs work.';

create index speaking_attempts_user_exam_idx on speaking_attempts (user_id, exam_id, created_at desc);

-- ============================================================================
-- writing_attempts
-- ============================================================================
create table writing_attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  exam_id         uuid not null references exam_profiles(id) on delete cascade,
  task_type       text not null,   -- 'picture_description' | 'email_response' | 'opinion_essay'
  submitted_text  text not null,
  rubric_scores   jsonb not null default '{}', -- { task_fulfillment, organization, grammar_vocab_range }
  ai_feedback     text,
  created_at      timestamptz not null default now()
);

comment on table writing_attempts is
  'One row per writing practice attempt. rubric_scores follows ETS Writing criteria (task fulfillment / organization / grammar & vocab range) scored independently, mirroring speaking_attempts.';

create index writing_attempts_user_exam_idx on writing_attempts (user_id, exam_id, created_at desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================
-- questions is shared reference content: readable by any authenticated
-- user, writable only by service role (import tooling), same pattern as
-- exam_profiles/words/word_tags in 0001.
alter table questions        enable row level security;
alter table weakness_logs    enable row level security;
alter table speaking_attempts enable row level security;
alter table writing_attempts  enable row level security;

create policy questions_select_authenticated on questions
  for select
  to authenticated
  using (true);

create policy weakness_logs_select_own on weakness_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy weakness_logs_insert_own on weakness_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy weakness_logs_delete_own on weakness_logs
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy speaking_attempts_select_own on speaking_attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy speaking_attempts_insert_own on speaking_attempts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy speaking_attempts_update_own on speaking_attempts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy speaking_attempts_delete_own on speaking_attempts
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy writing_attempts_select_own on writing_attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy writing_attempts_insert_own on writing_attempts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy writing_attempts_update_own on writing_attempts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy writing_attempts_delete_own on writing_attempts
  for delete
  to authenticated
  using (auth.uid() = user_id);
