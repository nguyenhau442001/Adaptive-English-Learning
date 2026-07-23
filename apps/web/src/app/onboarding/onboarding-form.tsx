'use client';

import { useState, useTransition } from 'react';
import { bulkMarkOnboarding } from './actions';

interface Word {
  id: string;
  term: string;
  ipa: string | null;
  meanings: unknown;
}

type Meaning = { pos: string; definition: string };

function firstDefinition(meanings: unknown): string {
  if (Array.isArray(meanings) && meanings.length > 0) {
    const m = meanings[0] as Meaning;
    return `${m.pos ? m.pos + ' ' : ''}${m.definition ?? ''}`;
  }
  return '';
}

export function OnboardingForm({ words }: { words: Word[] }) {
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setKnown((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function markAllKnown() {
    setKnown(new Set(words.map((w) => w.id)));
  }

  function clearAll() {
    setKnown(new Set());
  }

  function handleSubmit(formData: FormData) {
    for (const w of words) {
      formData.append(known.has(w.id) ? 'known' : 'unsure', w.id);
    }
    startTransition(() => {
      bulkMarkOnboarding(formData);
    });
  }

  return (
    <form action={handleSubmit} className="mt-6">
      <div className="mb-4 flex gap-2 text-sm">
        <button
          type="button"
          onClick={markAllKnown}
          className="rounded border border-neutral-300 px-3 py-1"
        >
          Mark all known
        </button>
        <button type="button" onClick={clearAll} className="rounded border border-neutral-300 px-3 py-1">
          Clear
        </button>
        <span className="ml-auto self-center text-neutral-500">
          {known.size} / {words.length} marked known
        </span>
      </div>

      <ul className="divide-y divide-neutral-200 rounded border border-neutral-200">
        {words.map((w) => (
          <li key={w.id} className="flex items-center gap-3 px-3 py-2">
            <input
              type="checkbox"
              checked={known.has(w.id)}
              onChange={() => toggle(w.id)}
              className="h-4 w-4"
            />
            <div className="flex-1">
              <span className="font-medium">{w.term}</span>
              {w.ipa && <span className="ml-2 text-xs text-neutral-500">/{w.ipa}/</span>}
              <span className="ml-2 text-sm text-neutral-600">{firstDefinition(w.meanings)}</span>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? 'Saving...' : 'Save and continue'}
      </button>
    </form>
  );
}
