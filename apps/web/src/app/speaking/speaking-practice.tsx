'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { SPEAKING_TASKS } from './task-types';

type GradeResult = {
  score: number;
  max_score: number;
  criterion_scores?: { pronunciation: number; intonation_stress: number };
  rubric_scores: Record<string, number>;
  ai_feedback: string;
};

const CRITERIA: Record<(typeof SPEAKING_TASKS)[number]['type'], string[]> = {
  read_aloud: ['Pronunciation', 'Intonation and stress'],
  describe_picture: ['Task appropriateness', 'Delivery', 'Grammar', 'Vocabulary', 'Cohesion'],
  respond_questions: ['Relevance and completeness', 'Delivery', 'Grammar', 'Vocabulary'],
  respond_using_information: ['Accuracy and completeness', 'Delivery', 'Grammar', 'Vocabulary'],
  express_opinion: ['Supported opinion', 'Coherence', 'Delivery', 'Grammar', 'Vocabulary'],
};

export function SpeakingPractice() {
  const [taskIndex, setTaskIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const confidenceRef = useRef<number[]>([]);
  const task = SPEAKING_TASKS[taskIndex];

  function selectTask(index: number) {
    recognitionRef.current?.stop();
    setTaskIndex(index);
    setTranscript('');
    setResult(null);
    setRecording(false);
  }

  function startRecording() {
    const SpeechRecognitionCtor =
      typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    setTranscript('');
    setResult(null);
    confidenceRef.current = [];
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let text = '';
      const confidences: number[] = [];
      for (let i = 0; i < event.results.length; i += 1) {
        const item = event.results[i][0];
        text += `${item.transcript} `;
        if (event.results[i].isFinal && typeof item.confidence === 'number') confidences.push(item.confidence);
      }
      setTranscript(text.trim());
      confidenceRef.current = confidences;
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  async function submitForGrading() {
    setGrading(true);
    try {
      const confidences = confidenceRef.current;
      const confidence = confidences.length
        ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length
        : null;
      const response = await fetch('/api/speaking/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: task.type,
          prompt: task.prompt,
          transcript,
          confidence,
          maxScore: task.maxScore,
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
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5" role="tablist" aria-label="Các dạng bài Speaking">
        {SPEAKING_TASKS.map((item, index) => (
          <button
            type="button"
            role="tab"
            aria-selected={index === taskIndex}
            key={item.type}
            onClick={() => selectTask(index)}
            className={`rounded-xl border px-3 py-3 text-left transition ${
              index === taskIndex
                ? 'border-cyan-500 bg-cyan-50 text-cyan-950 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
            }`}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wide">{item.questionRange}</span>
            <span className="mt-1 block text-xs font-semibold leading-4">{item.label}</span>
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">{task.questionRange}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{task.label}</h2>
          </div>
          <div className="mt-3 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:mt-0">
            Luyện tập tự do · Không đếm giờ
          </div>
        </header>

        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <div className="mb-5 rounded-xl border-l-4 border-cyan-500 bg-cyan-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">Directions</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{task.directions}</p>
            </div>

            {task.image && (
              <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image src={task.image} alt="Ba đồng nghiệp đang làm việc quanh một chiếc bàn trong văn phòng" width={960} height={560} className="h-auto w-full" priority />
              </div>
            )}

            {task.information && (
              <div className="mb-5 overflow-hidden rounded-xl border border-slate-300">
                <div className="bg-slate-900 px-4 py-3 text-sm font-bold text-white">{task.information.heading}</div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <tbody>
                      {task.information.rows.map((row, rowIndex) => (
                        <tr key={row.join('-')} className={rowIndex === 0 ? 'bg-slate-100 font-semibold' : 'border-t border-slate-200'}>
                          {row.map((cell) => <td key={cell} className="px-3 py-2.5">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Prompt</p>
              <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-slate-900">{task.prompt}</p>
            </div>

            {!supported && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Trình duyệt không hỗ trợ nhận diện giọng nói. Bạn vẫn có thể nhập transcript để luyện nội dung.
              </p>
            )}

            <div className="mt-5 flex gap-3">
              {!recording ? (
                <button type="button" onClick={startRecording} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700">
                  ● Bắt đầu ghi âm
                </button>
              ) : (
                <button type="button" onClick={() => recognitionRef.current?.stop()} className="animate-pulse rounded-xl bg-red-800 px-5 py-2.5 text-sm font-bold text-white">
                  ■ Dừng ghi âm
                </button>
              )}
              <button type="button" onClick={() => { setTranscript(''); setResult(null); }} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">
                Làm lại
              </button>
            </div>

            <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="speaking-transcript">Transcript bài nói</label>
            <textarea
              id="speaking-transcript"
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder="Transcript sẽ xuất hiện khi bạn nói; cũng có thể nhập thủ công để luyện nội dung..."
              rows={6}
              className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm leading-6 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
            <button type="button" onClick={submitForGrading} disabled={!transcript.trim() || grading} className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
              {grading ? 'Đang đối chiếu rubric...' : `Chấm theo rubric ${task.maxScore} điểm`}
            </button>
          </div>

          <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Format đề thật</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{task.officialTiming}</p>
            <p className="mt-1 text-xs text-slate-500">Chỉ để tham khảo; chế độ này không áp dụng giới hạn.</p>
            <div className="my-4 border-t border-slate-200" />
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">ETS đánh giá</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {CRITERIA[task.type].map((criterion) => <li key={criterion}>✓ {criterion}</li>)}
            </ul>
            <p className="mt-4 rounded-lg bg-white p-3 text-xs leading-5 text-slate-600">
              Thang câu này: <strong>0–{task.maxScore}</strong>. Điểm luyện tập là ước lượng, không phải điểm ETS chính thức.
            </p>
          </aside>
        </div>
      </section>

      {result && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Kết quả theo đúng thang task</p><h2 className="mt-1 text-xl font-bold text-slate-950">Phản hồi bài luyện</h2></div>
            <div className="rounded-xl bg-slate-950 px-5 py-3 text-center text-white"><strong className="text-2xl">{result.score}</strong><span className="text-sm">/{result.max_score}</span></div>
          </div>
          {result.criterion_scores && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3 text-sm">Pronunciation <strong className="float-right">{result.criterion_scores.pronunciation}/3</strong></div>
              <div className="rounded-lg bg-white p-3 text-sm">Intonation &amp; stress <strong className="float-right">{result.criterion_scores.intonation_stress}/3</strong></div>
            </div>
          )}
          <p className="mt-4 text-sm leading-6 text-slate-700">{result.ai_feedback}</p>
        </section>
      )}
    </div>
  );
}
