// Builds a single self-contained toeic-flashcards.html at the repo root.
//
// The page has no build step and no external files: the whole TOEIC word
// bank is inlined into a <script> block, so the .html can be copied to any
// device and opened straight from the filesystem. Re-run this after
// editing any packages/exam-profiles/toeic/data/words.*.seed.ts file:
//
//   npx tsx tools/build-flashcards-html.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { toeicWordSeeds } from '../packages/exam-profiles/toeic/src/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

function wordId(term) {
  return term.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const words = toeicWordSeeds
  .filter((w) => !w.meanings.some((m) => /placeholder/i.test(m.definition)))
  .map((w) => ({
    id: wordId(w.term),
    term: w.term,
    ipa: w.ipa,
    meanings: w.meanings,
    examples: w.examples,
    context: w.context,
    skill: w.skill,
    difficulty: w.difficultyForExam,
  }));

const template = readFileSync(resolve(here, 'flashcards-template.html'), 'utf8');
const json = JSON.stringify(words).replace(/</g, '\\u003c');
const out = template.replace('/*__WORD_BANK__*/', () => json);

writeFileSync(resolve(repoRoot, 'toeic-flashcards.html'), out);
console.log(`toeic-flashcards.html written with ${words.length} words`);
