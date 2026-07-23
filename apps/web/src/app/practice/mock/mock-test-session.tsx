'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { submitAnswer } from '../actions';

interface QuestionContent {
  passage?: string;
  audioTranscript?: string;
  questionText: string;
  choices: string[];
}

interface Question {
  id: string;
  part: string;
  question_type: string;
  content: QuestionContent;
  correct_answer: string;
}

const LISTENING_SECONDS = 45 * 60;
const READING_SECONDS = 75 * 60;

type Section = 'listening' | 'reading' | 'done';

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export function MockTestSession({
  listening,
  reading,
}: {
  listening: Question[];
  reading: Question[];
}) {
  const [section, setSection] = useState<Section>(listening.length > 0 ? 'listening' : 'reading');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(
    listening.length > 0 ? LISTENING_SECONDS : READING_SECONDS
  );
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number } | null>(null);

  const questions = section === 'listening' ? listening : reading;
  const current = questions[index];

  // Timed sections: real countdown, auto-advances section on timeout.
  // Full-timing mock per the product brief (L 45' / R 75'), not per-question
  // timing — matches how the real TOEIC is administered.
  useEffect(() => {
    if (section === 'done') return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          advanceSection();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  function advanceSection() {
    if (section === 'listening') {
      if (reading.length > 0) {
        setSection('reading');
        setIndex(0);
        setSecondsLeft(READING_SECONDS);
      } else {
        finishTest();
      }
    } else {
      finishTest();
    }
  }

  function selectAnswer(choice: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: choice }));
  }

  function goNext() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
    } else {
      advanceSection();
    }
  }

  async function finishTest() {
    setSubmitting(true);
    const allQuestions = [...listening, ...reading];
    let correct = 0;
    for (const q of allQuestions) {
      const userAnswer = answers[q.id];
      if (!userAnswer) continue;
      const res = await submitAnswer(q.id, userAnswer);
      if (res.correct) correct++;
    }
    setResults({ correct, total: allQuestions.length });
    setSubmitting(false);
    setSection('done');
  }

  const allAnswered = useMemo(() => questions.every((q) => answers[q.id]), [questions, answers]);

  if (section === 'done') {
    return (
      <div className="rounded border border-neutral-200 p-6 text-center">
        <h1 className="text-xl font-semibold">Mock test complete</h1>
        {submitting ? (
          <p className="mt-2 text-neutral-600">Grading...</p>
        ) : results ? (
          <p className="mt-2 text-neutral-600">
            {results.correct} / {results.total} correct
          </p>
        ) : null}
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <Link href="/weakness" className="text-blue-600 underline">
            View weakness map
          </Link>
          <Link href="/" className="text-blue-600 underline">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!current) {
    return <p className="text-neutral-600">No questions in this section.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold capitalize">{section} section</h1>
        <span
          className={`rounded px-3 py-1 text-sm font-mono ${
            secondsLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-700'
          }`}
        >
          {formatTime(secondsLeft)}
        </span>
      </div>

      <p className="mb-2 text-sm text-neutral-500">
        {current.part} · {index + 1}/{questions.length}
      </p>

      <div className="rounded border border-neutral-200 p-6">
        {current.content.passage && (
          <p className="mb-4 whitespace-pre-line text-sm text-neutral-700">
            {current.content.passage}
          </p>
        )}
        {current.content.audioTranscript && (
          <details className="mb-4 text-sm text-neutral-600">
            <summary className="cursor-pointer text-neutral-500">Audio transcript</summary>
            <p className="mt-2 whitespace-pre-line">{current.content.audioTranscript}</p>
          </details>
        )}
        <p className="font-medium">{current.content.questionText}</p>

        <div className="mt-4 flex flex-col gap-2">
          {current.content.choices.map((choice) => (
            <button
              key={choice}
              onClick={() => selectAnswer(choice)}
              className={`rounded border px-3 py-2 text-left text-sm ${
                answers[current.id] === choice
                  ? 'border-neutral-900 bg-neutral-100'
                  : 'border-neutral-300'
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="rounded border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={goNext}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {index + 1 < questions.length ? 'Next' : 'Finish section'}
        </button>
      </div>
      {!allAnswered && (
        <p className="mt-2 text-xs text-neutral-500">
          Unanswered questions are scored as incorrect when the section ends.
        </p>
      )}
    </div>
  );
}
