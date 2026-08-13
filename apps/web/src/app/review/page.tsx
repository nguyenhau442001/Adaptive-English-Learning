import Link from 'next/link';
import { toeicWordSeeds } from '@aelearning/exam-profile-toeic';
import { wordId } from '@/lib/local-learning-store';
import { ReviewSession } from './review-session';

export default function ReviewPage() {
  const words = toeicWordSeeds.map((word) => ({
    id: wordId(word.term),
    term: word.term,
    ipa: word.ipa,
    meanings: word.meanings,
    examples: word.examples,
  }));

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Review</h1>
        <Link href="/" className="text-sm text-blue-600 underline">
          Dashboard
        </Link>
      </div>

      <ReviewSession words={words} />
    </div>
  );
}
