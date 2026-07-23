'use client';

import { useState, useTransition } from 'react';
import { submitAnswer } from './actions';

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

export function PracticeSession({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; explanation: string | null } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const question = questions[index];

  if (!question) {
    return (
      <div className="rounded border border-neutral-200 p-6 text-center">
        <p className="text-lg font-medium">Practice set complete</p>
        <p className="mt-1 text-sm text-neutral-600">
          {score.correct} / {score.total} correct
        </p>
      </div>
    );
  }

  function handleSelect(choice: string) {
    if (result) return;
    setSelected(choice);
    startTransition(async () => {
      const res = await submitAnswer(question.id, choice);
      setResult(res);
      setScore((s) => ({ correct: s.correct + (res.correct ? 1 : 0), total: s.total + 1 }));
    });
  }

  function next() {
    setIndex((i) => i + 1);
    setSelected(null);
    setResult(null);
  }

  return (
    <div>
      <p className="mb-2 text-sm text-neutral-500">
        {question.part} · {question.question_type} · {index + 1}/{questions.length}
      </p>

      <div className="rounded border border-neutral-200 p-6">
        {question.content.passage && (
          <p className="mb-4 whitespace-pre-line text-sm text-neutral-700">
            {question.content.passage}
          </p>
        )}
        {question.content.audioTranscript && (
          <details className="mb-4 text-sm text-neutral-600">
            <summary className="cursor-pointer text-neutral-500">
              Audio transcript (no real audio in this demo — read as if listening)
            </summary>
            <p className="mt-2 whitespace-pre-line">{question.content.audioTranscript}</p>
          </details>
        )}
        <p className="font-medium">{question.content.questionText}</p>

        <div className="mt-4 flex flex-col gap-2">
          {question.content.choices.map((choice) => {
            const isSelected = selected === choice;
            const isCorrectChoice = result && choice === question.correct_answer;
            const isWrongSelected = result && isSelected && !result.correct;

            return (
              <button
                key={choice}
                disabled={!!result || isPending}
                onClick={() => handleSelect(choice)}
                className={`rounded border px-3 py-2 text-left text-sm ${
                  isCorrectChoice
                    ? 'border-green-600 bg-green-50'
                    : isWrongSelected
                      ? 'border-red-600 bg-red-50'
                      : 'border-neutral-300'
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {result && (
          <div className="mt-4 rounded bg-neutral-50 p-3 text-sm">
            <p className={result.correct ? 'text-green-700' : 'text-red-700'}>
              {result.correct ? 'Correct' : 'Incorrect'}
            </p>
            {result.explanation && <p className="mt-1 text-neutral-700">{result.explanation}</p>}
          </div>
        )}
      </div>

      {result && (
        <button
          onClick={next}
          className="mt-4 w-full rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Next question
        </button>
      )}
    </div>
  );
}
