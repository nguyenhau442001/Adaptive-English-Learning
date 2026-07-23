# Adaptive English Learning

Adaptive, personalized TOEIC prep for a 990-band target — no linear curriculum, no static
question bank walkthrough. Vocab SRS only schedules words you actually get wrong; Listening/Reading
mistakes get tagged by the specific trap that caused them (a Weakness Map, not a bare score);
Speaking/Writing get rubric feedback. Architecture is exam-agnostic so IELTS can be added later as
a data import, not a rewrite (see `docs/architecture.md`).

**Fully free to run, no account/login screen.** Supabase's free tier covers Postgres + Auth, and
Vercel's free tier covers hosting. There's no sign-up form — opening the app transparently creates
an anonymous Supabase session tied to your browser (see "How 'no login' works" below). Speaking/
Writing grading and Listening/Reading error classification are rule-based heuristics (see
`apps/web/src/lib/text-metrics.ts`) — no paid AI API is called anywhere in this app.

## Option A — one-click launch, no terminal (recommended)

Three one-time setup steps in your browser, then a permanent link you just open — no account,
no login, ever.

1. **Create a free Supabase project**: go to [supabase.com](https://supabase.com) → New Project.
   Once it's created, open **Project Settings → API** and keep that tab open — you'll copy 3
   values from it in a later step.

2. **Create the database tables**: in your Supabase project, open the **SQL Editor** (left
   sidebar) → New query. Paste in the contents of
   [`packages/vocab-core/migrations/0001_init_vocab_core.sql`](packages/vocab-core/migrations/0001_init_vocab_core.sql)
   and click Run. Repeat for
   [`0002_practice_and_weakness.sql`](packages/vocab-core/migrations/0002_practice_and_weakness.sql).

3. **Enable anonymous sessions**: in the same project, go to **Authentication → Sign In / Providers**
   → find **Anonymous Sign-Ins** → turn it on. This is what lets the app skip a login screen
   entirely.

4. **Deploy the app** — click this button:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnguyenhau442001%2FAdaptive-English-Learning&root-directory=apps%2Fweb&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=From%20your%20Supabase%20project%27s%20Settings%20%E2%86%92%20API%20page&envLink=https%3A%2F%2Fsupabase.com%2Fdashboard%2Fproject%2F_%2Fsettings%2Fapi&project-name=adaptive-english-learning&repository-name=adaptive-english-learning)

   It'll ask you to log in with GitHub, then paste in the 3 values from the Supabase API page
   (`Project URL`, `anon public` key, `service_role` key). Click Deploy and wait ~2 minutes.
   *(This button wasn't tested against a real Vercel account from here — if importing the repo
   doesn't correctly detect `apps/web` as the app, manually set "Root Directory" to `apps/web` in
   the import screen before deploying.)*

5. **Open your new URL** — you land straight on the dashboard, no login. Click
   **"Load starter content"** once (loads 314 words + sample questions — no terminal, just a
   button in the app). That's it — bookmark the URL, it's permanent.

## Option B — run on your own machine (for developers)

- Node.js 22+ (the pinned `@supabase/supabase-js` version warns on Node 20 and below; still runs,
  just noisy).
- A free [Supabase](https://supabase.com) project with anonymous sign-ins enabled (steps 1-3 from
  Option A above).
- Optionally the [Supabase CLI](https://supabase.com/docs/guides/cli) instead of the SQL Editor.

```bash
npm install
cp .env.example .env   # fill in the 3 Supabase values, see comments in the file
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — no login — and click "Load starter content"
on the dashboard, same as Option A (no `npm run seed:toeic` needed either way; that CLI script
still exists and works if you prefer it, see `.env.example`'s comments, but isn't required).

## How "no login" works

There's no sign-up/sign-in form anywhere in this app. The first time you open it, `apps/web/src/proxy.ts`
(Next.js middleware) transparently calls Supabase's `signInAnonymously()` and stores the session in
a cookie — you land directly on the dashboard. It's still a real `auth.uid()`-backed session (not a
hack around Row Level Security), so `user_progress`, `weakness_logs`, and your Speaking/Writing
attempts are genuinely private to that session, persisted server-side, exactly like the rest of the
architecture assumes. The tradeoff: it's tied to *that browser* — clearing cookies or opening the
app in a different browser starts a fresh, empty session. That's the right tradeoff for a
single-user personal app you open like a bookmarked tool, not a multi-device product.

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
