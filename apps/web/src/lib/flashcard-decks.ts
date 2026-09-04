// Groups the TOEIC word bank into HSK-style "decks" the learner picks from
// on the flashcard home screen. A deck is just a named, filtered slice of
// toeicWordSeeds — no extra data model.

import { toeicWordSeeds } from '@aelearning/exam-profile-toeic';
import { wordId } from './flashcard-store';

export interface FlashcardWord {
  id: string;
  term: string;
  ipa: string | null;
  meanings: { pos: string; definition: string; translation?: string }[];
  examples: { sentence: string; translation?: string }[];
  context: string;
  skill: string;
  difficulty: number;
}

// Guard against any placeholder rows (definition literally "placeholder")
// that might slip back into the seed data during future edits.
const isPlaceholder = (w: (typeof toeicWordSeeds)[number]) =>
  w.meanings.some((m) => /placeholder/i.test(m.definition));

export const ALL_WORDS: FlashcardWord[] = toeicWordSeeds
  .filter((w) => !isPlaceholder(w))
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

const byId = new Map(ALL_WORDS.map((w) => [w.id, w]));
export function getWord(id: string): FlashcardWord | undefined {
  return byId.get(id);
}

export interface Deck {
  slug: string;
  name: string;
  blurb: string;
  wordIds: string[];
}

function deck(slug: string, name: string, blurb: string, words: FlashcardWord[]): Deck {
  return { slug, name, blurb, wordIds: words.map((w) => w.id) };
}

const CONTEXTS: { context: string; name: string; blurb: string }[] = [
  { context: 'Part 5', name: 'Part 5 · Câu chưa hoàn chỉnh', blurb: 'Từ vựng & word form cho câu Part 5' },
  { context: 'Part 6', name: 'Part 6 · Đoạn văn', blurb: 'Từ nối, thì, mạch logic đoạn văn' },
  { context: 'Part 7', name: 'Part 7 · Đọc hiểu', blurb: 'Từ vựng email, thông báo, bài báo' },
  { context: 'Listening Part 3', name: 'Listening Part 3 · Hội thoại', blurb: 'Từ vựng hội thoại công sở' },
  { context: 'Listening Part 4', name: 'Listening Part 4 · Bài nói', blurb: 'Từ vựng thông báo, bản tin, bài giảng' },
  { context: 'General Business', name: 'Speaking & Writing · Business', blurb: 'Từ vựng dùng khi nói và viết' },
];

export const DECKS: Deck[] = [
  deck('hard', 'Bẫy khó · Band 900+', 'Từ khó nhất: near-synonym & collocation (độ khó 4–5)',
    ALL_WORDS.filter((w) => w.difficulty >= 4)),
  deck('core', 'Nền tảng · 700+', 'Từ độ khó vừa, xây nền vững (độ khó 2–3)',
    ALL_WORDS.filter((w) => w.difficulty >= 2 && w.difficulty <= 3)),
  ...CONTEXTS.map(({ context, name, blurb }) =>
    deck(
      context.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      blurb,
      ALL_WORDS.filter((w) => w.context === context),
    ),
  ),
  deck('all', 'Toàn bộ từ vựng', 'Học tuần tự cả ngân hàng', ALL_WORDS),
].filter((d) => d.wordIds.length > 0);

const bySlug = new Map(DECKS.map((d) => [d.slug, d]));
export function getDeck(slug: string): Deck | undefined {
  return bySlug.get(slug);
}
