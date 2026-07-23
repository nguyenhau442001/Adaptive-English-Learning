'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SeedContentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function seed() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage(`Loaded ${data.wordCount} words, ${data.questionCount} questions.`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Seeding failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-10 rounded border border-dashed border-neutral-300 p-4 text-sm">
      <p className="mb-2 text-neutral-600">
        No TOEIC content loaded yet. Load the starter set (314 words + sample questions) —
        one click, no terminal needed.
      </p>
      <button
        onClick={seed}
        disabled={loading}
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Loading content...' : 'Load starter content'}
      </button>
      {message && <p className="mt-2 text-neutral-600">{message}</p>}
    </div>
  );
}
