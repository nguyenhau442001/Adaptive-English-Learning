# Adaptive English Learning

Local-first English learning app with two independent tracks:

- **Vu Dai TOEIC**: Listening, Reading, Speaking and Writing following the exam format.
- **Executive English Lab**: C1–C2 lessons for software engineers at international tech
  companies, focused on IT systems, architecture, API integration, incidents, requirements,
  code review and release. Each lesson follows the flow: learn concept → view sample
  dialogue → do exercises → review mistakes.

No account, database, API key, or `.env` file needed. Content is bundled in the repository;
progress, vocabulary SRS state, common mistakes, and lesson scores are stored via `localStorage`
in the browser.

## Use it now (no install needed)

- Vu Dai TOEIC (static HTML demo): https://nguyenhau442001.github.io/Adaptive-English-Learning/
- Offline vocabulary flashcards: https://nguyenhau442001.github.io/Adaptive-English-Learning/toeic-flashcards.html

Both pages run as static sites on GitHub Pages and redeploy automatically whenever `main`
updates the related files (see `.github/workflows/deploy-pages.yml`). For the full Next.js app
(Executive English Lab, arena, SRS, etc.), run it locally following the instructions below.

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Don't open `vu-dai-toeic.html` with Live
Server; that's just the legacy HTML demo and doesn't share the asset pipeline with the Next.js app.

## Offline vocabulary flashcards (`toeic-flashcards.html`)

`toeic-flashcards.html` at the repo root is a standalone flashcard build: the entire word bank
is embedded directly in the file, no `npm` needed, no extra files to load. Copy this file to any
machine or device and open it in a browser. Progress is stored via `localStorage`, separately per
device.

After editing any `packages/exam-profiles/toeic/data/words.*.seed.ts` file, rebuild the file with:

```bash
npx tsx tools/build-flashcards-html.mjs
```

## Production build

```bash
npm run build
npm run start --workspace=web
```

No environment variables needed for deployment. On Vercel, set **Root Directory** to `apps/web`.

## Where is data stored?

All personal data lives only in the current browser:

- arena progress and character equipment;
- Executive English lessons completed, best scores, and practice count;
- vocabulary SRS state;
- Weakness Map generated from wrong answers.

Clearing site data in the browser resets all progress. Data does not sync automatically across
devices or browsers.

## Content and scoring

- The vocabulary bank, TOEIC questions, and Executive English lessons are all local data managed
  by the project.
- Listening uses the browser's Speech Synthesis.
- Speaking uses the Web Speech API where the browser supports it.
- Speaking/Writing are scored by an internal rubric-based heuristic; no paid AI service is called.
- Practice scores are a directional signal, not an official ETS result.

## Monorepo structure

- `apps/web` — Next.js App Router application.
- `packages/vocab-core` — pure TypeScript SM-2 engine.
- `packages/exam-profiles/toeic` — TOEIC vocabulary, questions, and error taxonomy.
- `docs/architecture.md` — local-first architecture principles.
