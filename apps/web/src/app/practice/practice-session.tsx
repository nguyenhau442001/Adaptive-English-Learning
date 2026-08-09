'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { ToeicPracticeSet } from '@/lib/toeic-practice-data';

export function PracticeSession({ sets }: { sets: ToeicPracticeSet[] }) {
  const [setIndex, setSetIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [complete, setComplete] = useState(false);
  const set = sets[setIndex];
  const question = set?.questions[questionIndex];

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!set || !question) return <div className="rounded-xl border border-slate-200 bg-white p-6">Chưa có bài luyện cho Part này.</div>;

  function playAudio() {
    if (!set.audioScript || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(set.audioScript);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }

  function chooseAnswer(index: number) {
    if (selected !== null) return;
    setSelected(index);
    setScore((current) => ({ correct: current.correct + (index === question.answer ? 1 : 0), total: current.total + 1 }));
  }

  function nextQuestion() {
    if (questionIndex + 1 < set.questions.length) {
      setQuestionIndex((value) => value + 1);
      setSelected(null);
      return;
    }
    if (setIndex + 1 < sets.length) {
      setSetIndex((value) => value + 1);
      setQuestionIndex(0);
      setSelected(null);
      return;
    }
    setComplete(true);
  }

  function restart() {
    setSetIndex(0); setQuestionIndex(0); setSelected(null); setScore({ correct: 0, total: 0 }); setComplete(false);
  }

  if (complete) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Hoàn thành Part {set.part}</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">{score.correct}/{score.total} câu đúng</h2>
        <p className="mt-2 text-sm text-slate-600">Đây là điểm của bộ luyện, không quy đổi trực tiếp sang thang TOEIC 5–495.</p>
        <button type="button" onClick={restart} className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white">Luyện lại Part này</button>
      </section>
    );
  }

  const answered = selected !== null;
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white sm:flex sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Part {set.part}</p><h2 className="mt-1 text-xl font-bold">{set.title}</h2></div>
        <div className="mt-3 text-xs text-slate-300 sm:mt-0"><span className="rounded-full bg-white/10 px-3 py-1.5">Không giới hạn thời gian</span></div>
      </header>

      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700">
        <strong>Directions:</strong> {set.directions}
        <span className="ml-2 text-xs text-slate-500">({set.format})</span>
      </div>

      <div className="p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Question {questionIndex + 1} of {set.questions.length}</span>
          <span>Score {score.correct}/{score.total}</span>
        </div>

        {set.image && <div className="mb-6 overflow-hidden rounded-xl border border-slate-200"><Image src={set.image} alt="A modern office scene" width={960} height={560} className="h-auto w-full" priority /></div>}

        {set.audioScript && (
          <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <button type="button" onClick={playAudio} className="rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-800">▶ Phát audio</button>
            <span className="ml-3 text-xs text-cyan-900">Có thể nghe lại trong chế độ luyện tập.</span>
            {answered && <details className="mt-3 text-sm text-slate-700"><summary className="cursor-pointer font-semibold">Xem transcript sau khi trả lời</summary><p className="mt-2 leading-6">{set.audioScript}</p></details>}
          </div>
        )}

        {set.passages && <div className={`mb-6 grid gap-4 ${set.passages.length > 1 ? 'lg:grid-cols-2' : ''}`}>{set.passages.map((passage, index) => <article key={`${passage.label}-${index}`} className="rounded-xl border border-slate-300 bg-[#fffefa] p-5"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-700">{passage.label ?? 'Text'}</p><p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{passage.text}</p></article>)}</div>}

        <div className="rounded-xl border border-slate-200 p-5">
          <p className="text-base font-bold leading-7 text-slate-950">{question.question}</p>
          <div className={`mt-4 grid gap-3 ${set.hideChoiceText ? 'grid-cols-2 sm:grid-cols-4' : ''}`}>
            {question.choices.map((choice, index) => {
              const correct = answered && index === question.answer;
              const wrong = answered && index === selected && index !== question.answer;
              return (
                <button type="button" key={choice} disabled={answered} onClick={() => chooseAnswer(index)} className={`rounded-xl border px-4 py-3 text-left text-sm transition ${correct ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : wrong ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-300 bg-white hover:border-slate-500'} ${set.hideChoiceText ? 'text-center text-base font-bold' : ''}`}>
                  <span className={set.hideChoiceText ? '' : 'mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold'}>{String.fromCharCode(65 + index)}</span>
                  {!set.hideChoiceText && choice}
                </button>
              );
            })}
          </div>
        </div>

        {answered && (
          <div className={`mt-5 rounded-xl border p-4 ${selected === question.answer ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <p className={`font-bold ${selected === question.answer ? 'text-emerald-800' : 'text-red-800'}`}>{selected === question.answer ? 'Chính xác' : `Chưa đúng — đáp án ${String.fromCharCode(65 + question.answer)}`}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{question.explanation}</p>
            {set.hideChoiceText && <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm text-slate-600">{question.choices.map((choice, index) => <p key={choice}><strong>{String.fromCharCode(65 + index)}.</strong> {choice}</p>)}</div>}
          </div>
        )}

        {answered && <button type="button" onClick={nextQuestion} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">{questionIndex + 1 === set.questions.length && setIndex + 1 === sets.length ? 'Xem kết quả' : 'Câu tiếp theo →'}</button>}
      </div>
    </section>
  );
}
