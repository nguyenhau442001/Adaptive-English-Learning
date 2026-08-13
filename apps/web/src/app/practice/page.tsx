import Link from 'next/link';
import { TOEIC_PRACTICE_SETS } from '@/lib/toeic-practice-data';
import { PracticeSession } from './practice-session';

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ skill?: string; part?: string }> }) {
  const params = await searchParams;
  const skill = params.skill === 'reading' ? 'reading' : 'listening';
  const allowedParts = skill === 'listening' ? [1, 2, 3, 4] : [5, 6, 7];
  const requestedPart = Number(params.part);
  const part = allowedParts.includes(requestedPart) ? requestedPart : allowedParts[0];
  const sets = TOEIC_PRACTICE_SETS.filter((set) => set.skill === skill && set.part === part);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[.2em] ${skill === 'listening' ? 'text-cyan-700' : 'text-violet-700'}`}>TOEIC {skill}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Luyện {skill === 'listening' ? 'nghe' : 'đọc'} đúng cấu trúc đề</h1>
            <p className="mt-2 text-sm text-slate-600">Câu hỏi theo format ETS · phản hồi sau từng câu · không giới hạn thời gian</p>
          </div>
          <Link href="/" className="text-sm font-semibold text-slate-600 underline">Về đấu trường</Link>
        </div>

        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Chọn Part TOEIC">
          {allowedParts.map((item) => (
            <Link key={item} href={`/practice?skill=${skill}&part=${item}`} className={`rounded-xl border px-5 py-2.5 text-sm font-bold ${item === part ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>Part {item}</Link>
          ))}
        </nav>

        <PracticeSession sets={sets} />
      </div>
    </main>
  );
}
