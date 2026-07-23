'use client';

import { useState } from 'react';
import { WRITING_TASKS } from './task-types';

interface RubricScores {
  task_fulfillment: number;
  organization: number;
  grammar_vocab_range: number;
}

const RUBRIC_LABELS: { key: keyof RubricScores; label: string }[] = [
  { key: 'task_fulfillment', label: 'Task Fulfillment' },
  { key: 'organization', label: 'Organization' },
  { key: 'grammar_vocab_range', label: 'Grammar & Vocabulary Range' },
];

function wordCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export function WritingPractice() {
  const [taskIndex, setTaskIndex] = useState(0);
  const [submittedText, setSubmittedText] = useState('');
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<{
    rubric_scores: RubricScores;
    ai_feedback: string;
  } | null>(null);

  const task = WRITING_TASKS[taskIndex];
  const words = wordCount(submittedText);
  const meetsMinimum = words >= task.minWords;

  async function submitForGrading() {
    setGrading(true);
    try {
      const res = await fetch('/api/writing/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType: task.type, prompt: task.prompt, submittedText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.attempt);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Grading failed');
    } finally {
      setGrading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {WRITING_TASKS.map((t, i) => (
          <button
            key={t.type}
            onClick={() => {
              setTaskIndex(i);
              setSubmittedText('');
              setResult(null);
            }}
            className={`rounded px-3 py-1 ${
              i === taskIndex ? 'bg-neutral-900 text-white' : 'border border-neutral-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded border border-neutral-200 p-6">
        <p className="mb-4 whitespace-pre-wrap text-sm text-neutral-700">{task.prompt}</p>

        <textarea
          value={submittedText}
          onChange={(e) => setSubmittedText(e.target.value)}
          placeholder="Write your response here"
          rows={10}
          className="w-full rounded border border-neutral-300 p-2 text-sm"
        />

        <p className={`mt-2 text-xs ${meetsMinimum ? 'text-neutral-500' : 'text-amber-700'}`}>
          {words} word{words === 1 ? '' : 's'} (minimum {task.minWords})
        </p>

        <button
          onClick={submitForGrading}
          disabled={!submittedText.trim() || grading}
          className="mt-4 w-full rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {grading ? 'Grading...' : 'Submit for grading'}
        </button>
      </div>

      {result && (
        <div className="mt-6 rounded border border-neutral-200 p-6">
          <h2 className="mb-3 font-semibold">Rubric scores (0-5 each)</h2>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            {RUBRIC_LABELS.map(({ key, label }) => (
              <div key={key} className="flex justify-between rounded bg-neutral-50 px-3 py-2">
                <span>{label}</span>
                <span className="font-medium">{result.rubric_scores[key]}/5</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-neutral-700">{result.ai_feedback}</p>
        </div>
      )}
    </div>
  );
}
