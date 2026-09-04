import Link from 'next/link';
import { DECKS } from '@/lib/flashcard-decks';
import { FlashcardApp } from './flashcard-app';

export const metadata = {
  title: 'TOEIC Flashcards — Học từ vựng band 900+',
};

export default function FlashcardPage() {
  const decks = DECKS.map((d) => ({ slug: d.slug, name: d.name, blurb: d.blurb, count: d.wordIds.length }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">TOEIC Flashcards</h1>
        <Link href="/" className="text-sm text-blue-600 underline">
          Đấu trường
        </Link>
      </div>
      <FlashcardApp decks={decks} />
    </div>
  );
}
