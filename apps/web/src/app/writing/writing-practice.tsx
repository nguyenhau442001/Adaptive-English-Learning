'use client';

import Image from 'next/image';
import { useState } from 'react';
import { WRITING_TASKS } from './task-types';

type GradeResult = {
  score: number;
  max_score: number;
  rubric_scores: Record<string, number>;
  ai_feedback: string;
};

const CRITERIA: Record<(typeof WRITING_TASKS)[number]['type'], string[]> = {
  picture_description: ['Grammar', 'Use of both given words', 'Relevance to the picture', 'Exactly one sentence for full credit'],
  email_response: ['Completion of every required task', 'Sentence quality and variety', 'Vocabulary', 'Organization, tone, and register'],
  opinion_essay: ['Support with reasons/examples', 'Grammar', 'Vocabulary', 'Organization and coherence'],
};

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function WritingPractice() {
  const [taskIndex, setTaskIndex] = useState(0);
  const [submittedText, setSubmittedText] = useState('');
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const task = WRITING_TASKS[taskIndex];
  const words = countWords(submittedText);

  function selectTask(index: number) {
    setTaskIndex(index);
    setSubmittedText('');
    setResult(null);
  }

  async function submitForGrading() {
    setGrading(true);
    try {
      const response = await fetch('/api/writing/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: task.type,
          prompt: `${task.prompt}\n${task.requirements?.join('\n') ?? ''}`,
          submittedText,
          keywords: task.keywords,
          requirements: task.requirements,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Không thể chấm bài');
      setResult(data.attempt as GradeResult);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không thể chấm bài');
    } finally {
      setGrading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Các dạng bài Writing">
        {WRITING_TASKS.map((item, index) => (
          <button
            type="button"
            role="tab"
            aria-selected={index === taskIndex}
            key={item.type}
            onClick={() => selectTask(index)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              index === taskIndex
                ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
            }`}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wide">{item.questionRange}</span>
            <span className="mt-1 block text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">{task.questionRange}</p><h2 className="mt-1 text-xl font-bold text-slate-950">{task.label}</h2></div>
          <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:mt-0">Luyện tập tự do · Không đếm giờ</span>
        </header>

        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_270px]">
          <div>
            <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Directions</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{task.directions}</p>
            </div>

            {task.image && <div className="mt-5 overflow-hidden rounded-xl border border-slate-200"><Image src={task.image} alt="Ba đồng nghiệp đang làm việc quanh một chiếc bàn trong văn phòng" width={960} height={560} className="h-auto w-full" priority /></div>}

            {task.keywords && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Given words</span>
                {task.keywords.map((keyword) => <strong key={keyword} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm">{keyword}</strong>)}
              </div>
            )}

            {task.email && (
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-300">
                <div className="space-y-1 bg-slate-100 px-4 py-3 text-sm">
                  <p><strong>From:</strong> {task.email.from}</p><p><strong>To:</strong> {task.email.to}</p><p><strong>Subject:</strong> {task.email.subject}</p>
                </div>
                <p className="whitespace-pre-wrap px-5 py-5 text-sm leading-7 text-slate-800">{task.email.body}</p>
              </div>
            )}

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your task</p>
              <p className="mt-2 text-base leading-7 text-slate-900">{task.prompt}</p>
              {task.requirements && <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">{task.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ol>}
            </div>

            <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="writing-response">Your response</label>
            <textarea
              id="writing-response"
              value={submittedText}
              onChange={(event) => { setSubmittedText(event.target.value); setResult(null); }}
              placeholder="Write your response in English..."
              rows={task.type === 'opinion_essay' ? 16 : 9}
              className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{words} words</span>
              {task.recommendedWords && <span>Gợi ý theo format: {task.recommendedWords}+ words</span>}
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={submitForGrading} disabled={!submittedText.trim() || grading} className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{grading ? 'Đang đối chiếu rubric...' : `Chấm theo rubric ${task.maxScore} điểm`}</button>
              <button type="button" onClick={() => { setSubmittedText(''); setResult(null); }} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Làm lại</button>
            </div>
          </div>

          <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Format đề thật</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{task.officialTiming}</p>
            <p className="mt-1 text-xs text-slate-500">Chỉ để tham khảo; chế độ này không áp dụng giới hạn.</p>
            <div className="my-4 border-t border-slate-200" />
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">ETS đánh giá</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">{CRITERIA[task.type].map((criterion) => <li key={criterion}>✓ {criterion}</li>)}</ul>
            <p className="mt-4 rounded-lg bg-white p-3 text-xs leading-5 text-slate-600">Thang câu này: <strong>0–{task.maxScore}</strong>. Điểm luyện tập là ước lượng, không phải điểm ETS chính thức.</p>
          </aside>
        </div>
      </section>

      {result && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Kết quả theo đúng thang task</p><h2 className="mt-1 text-xl font-bold text-slate-950">Phản hồi bài luyện</h2></div>
            <div className="rounded-xl bg-slate-950 px-5 py-3 text-center text-white"><strong className="text-2xl">{result.score}</strong><span className="text-sm">/{result.max_score}</span></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">{result.ai_feedback}</p>
        </section>
      )}
    </div>
  );
}
