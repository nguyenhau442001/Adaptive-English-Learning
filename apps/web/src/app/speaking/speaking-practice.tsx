'use client';

import { useRef, useState } from 'react';
import { SPEAKING_TASKS } from './task-types';

interface RubricScores {
  pronunciation: number;
  intonation: number;
  grammar: number;
  vocabulary: number;
  cohesion: number;
  relevance: number;
}

const RUBRIC_LABELS: { key: keyof RubricScores; label: string }[] = [
  { key: 'pronunciation', label: 'Pronunciation' },
  { key: 'intonation', label: 'Intonation & Stress' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'vocabulary', label: 'Vocabulary' },
  { key: 'cohesion', label: 'Cohesion' },
  { key: 'relevance', label: 'Relevance to Task' },
];

export function SpeakingPractice() {
  const [taskIndex, setTaskIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<{
    rubric_scores: RubricScores;
    ai_feedback: string;
  } | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const task = SPEAKING_TASKS[taskIndex];

  function startRecording() {
    const SpeechRecognitionCtor =
      typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    setTranscript('');
    setResult(null);

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = '';
      for (let i = 0; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript + ' ';
      }
      setTranscript(finalText.trim());
    };

    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  async function submitForGrading() {
    setGrading(true);
    try {
      const res = await fetch('/api/speaking/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType: task.type, prompt: task.prompt, transcript }),
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
      <div className="mb-4 flex gap-2 text-sm">
        {SPEAKING_TASKS.map((t, i) => (
          <button
            key={t.type}
            onClick={() => {
              setTaskIndex(i);
              setTranscript('');
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

      {!supported && (
        <p className="mb-4 rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Web Speech API is not supported in this browser. Try Chrome, or type your response
          manually below.
        </p>
      )}

      <div className="rounded border border-neutral-200 p-6">
        <p className="mb-4 text-sm text-neutral-700">{task.prompt}</p>

        <div className="flex gap-2">
          {!recording ? (
            <button
              onClick={startRecording}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Start recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="animate-pulse rounded bg-red-800 px-4 py-2 text-sm font-medium text-white"
            >
              Stop recording
            </button>
          )}
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Transcript will appear here as you speak (or type manually)"
          rows={5}
          className="mt-4 w-full rounded border border-neutral-300 p-2 text-sm"
        />

        <button
          onClick={submitForGrading}
          disabled={!transcript.trim() || grading}
          className="mt-4 w-full rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {grading ? 'Grading...' : 'Submit for grading'}
        </button>
      </div>

      {result && (
        <div className="mt-6 rounded border border-neutral-200 p-6">
          <h2 className="mb-3 font-semibold">Rubric scores (0-5 each)</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
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
