'use client';

import { useState, useTransition } from 'react';
import type { SrsGrade } from '@aelearning/vocab-core';
import { submitReview } from './actions';

interface Meaning {
  pos: string;
  definition: string;
}
interface Example {
  sentence: string;
}
interface ReviewItem {
  id: string;
  word_id: string;
  words: {
    id: string;
    term: string;
    ipa: string | null;
    meanings: Meaning[];
    examples: Example[];
  };
}

const GRADE_LABELS: { grade: SrsGrade; label: string; className: string }[] = [
  { grade: 'again', label: 'Again', className: 'bg-red-600' },
  { grade: 'hard', label: 'Hard', className: 'bg-orange-500' },
  { grade: 'good', label: 'Good', className: 'bg-green-600' },
  { grade: 'easy', label: 'Easy', className: 'bg-blue-600' },
];

export function ReviewSession({ items }: { items: ReviewItem[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(0);

  const current = items[index];

  if (!current || index >= items.length) {
    return (
      <div className="rounded border border-neutral-200 p-6 text-center">
        <p className="text-lg font-medium">Session complete</p>
        <p className="mt-1 text-sm text-neutral-600">Reviewed {done} words.</p>
      </div>
    );
  }

  function handleGrade(grade: SrsGrade) {
    startTransition(async () => {
      await submitReview(current.id, grade);
      setDone((d) => d + 1);
      setRevealed(false);
      setIndex((i) => i + 1);
    });
  }

  const word = current.words;

  return (
    <div>
      <p className="mb-2 text-sm text-neutral-500">
        {index + 1} / {items.length}
      </p>
      <div className="rounded border border-neutral-200 p-6">
        <p className="text-3xl font-semibold">{word.term}</p>
        {word.ipa && <p className="mt-1 text-neutral-500">/{word.ipa}/</p>}

        {revealed ? (
          <div className="mt-4 space-y-3">
            {word.meanings?.map((m, i) => (
              <p key={i} className="text-neutral-800">
                <span className="text-sm italic text-neutral-500">{m.pos}</span> {m.definition}
              </p>
            ))}
            {word.examples?.map((e, i) => (
              <p key={i} className="text-sm text-neutral-600">
                {e.sentence}
              </p>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 rounded border border-neutral-300 px-4 py-2 text-sm"
          >
            Show meaning
          </button>
        )}
      </div>

      {revealed && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {GRADE_LABELS.map(({ grade, label, className }) => (
            <button
              key={grade}
              disabled={isPending}
              onClick={() => handleGrade(grade)}
              className={`${className} rounded px-3 py-2 text-sm font-medium text-white disabled:opacity-50`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
