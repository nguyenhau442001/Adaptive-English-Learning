# Adaptive English Learning

Adaptive, personalized TOEIC prep for a 990-band target — no linear curriculum, no static
question bank walkthrough. Vocab SRS only schedules words you actually get wrong; Listening/Reading
mistakes get tagged by the specific trap that caused them (a Weakness Map, not a bare score);
Speaking/Writing get rubric feedback. Architecture is exam-agnostic so IELTS can be added later as
a data import, not a rewrite (see `docs/architecture.md`).

**Fully free to run.** Supabase's free tier covers Postgres + Auth. Speaking/Writing grading and
Listening/Reading error classification are rule-based heuristics (see
`apps/web/src/lib/text-metrics.ts`) — no paid AI API is called anywhere in this app.

## Prerequisites

- Node.js 22+ (the `@supabase/supabase-js` version pinned here warns on Node 20 and below; it
  still runs on 20, but 22 avoids the warning).
- A free [Supabase](https://supabase.com) project.
- Optionally the [Supabase CLI](https://supabase.com/docs/guides/cli) for `supabase db push`; if
  you'd rather not install it, you can paste the migration SQL into the Supabase dashboard's SQL
  Editor instead (see below).

## Setup

1. **Install dependencies** (from the repo root):
   ```bash
   npm install
   ```

2. **Create a Supabase project**, then copy `.env.example` to `.env` at the repo root and fill in
   the three values from Project Settings → API:
   ```bash
   cp .env.example .env
   ```
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. One
   root `.env` is read by both the Next.js app and the seed script — see the comments in
   `.env.example`.

3. **Run the migrations** to create the schema (`exam_profiles`, `words`, `word_tags`,
   `user_progress`, `questions`, `weakness_logs`, `speaking_attempts`, `writing_attempts` — all
   defined in `packages/vocab-core/migrations/`):

   - With the Supabase CLI:
     ```bash
     supabase login
     supabase link --project-ref <your-project-ref>
     supabase db push
     ```
     (`supabase/migrations` is a symlink to `packages/vocab-core/migrations`, so the CLI picks up
     the same files the repo documents as canonical.)
   - Without the CLI: open your project's SQL Editor in the Supabase dashboard and run
     `packages/vocab-core/migrations/0001_init_vocab_core.sql` then
     `packages/vocab-core/migrations/0002_practice_and_weakness.sql`, in that order.

4. **Seed TOEIC content** (314 high-band vocab words + a handful of sample ETS-style questions):
   ```bash
   npm run seed:toeic
   ```

5. **Run the app**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000), sign up with any email/password (Supabase
   Auth), and you'll land in onboarding.

## What's mock/demo data

- **Vocab (314 words)**: real high-band TOEIC vocabulary with meanings/examples, hand-authored —
  not scraped or licensed content, but not placeholder either.
- **Listening/Reading questions (7 sample items)**: illustrative items modeled on ETS Part
  5/6/7 and Listening Part 3/4 *formats*, not reproductions of real ETS test content. A real
  deployment would need a licensed item bank and a real import pipeline — parsing actual "đề cam"
  PDFs is explicitly out of scope for this build (see `docs/architecture.md`).
- **Speaking/Writing task prompts**: fixed sample prompts (one per ETS task type), not a rotating
  bank.
- **Grading/classification**: rule-based heuristics, not a certified ETS rater or real NLP model.
  Speaking pronunciation/intonation scores fall back to a neutral score when the browser's Web
  Speech API doesn't return a confidence value (e.g. manually-typed responses). Treat all scores as
  a directional signal, not an official rating.

## Monorepo structure

- `apps/web` — Next.js App Router + TS + Tailwind, PWA-ready, `capacitor.config.ts` prepped (not
  wired up) for a future mobile wrapper.
- `packages/vocab-core` — exam-agnostic SM-2 SRS engine + the shared DB migrations.
- `packages/exam-profiles/toeic` — TOEIC-specific constants, word/question seed data, seed script.
  Adding IELTS later means a sibling `packages/exam-profiles/ielts` package, never touching
  `vocab-core` or the `words`/`user_progress` schema.
- `docs/architecture.md` — the 5 non-negotiable architecture principles this build follows.
