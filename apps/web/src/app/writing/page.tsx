import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { WritingPractice } from './writing-practice';

export default async function WritingPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">TOEIC Writing</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Luyện viết đúng cấu trúc đề</h1>
          <p className="mt-2 text-sm text-slate-600">Đủ 3 dạng câu hỏi · thang 0–3 / 0–4 / 0–5 · không giới hạn thời gian</p>
        </div>
        <Link href="/" className="text-sm text-blue-600 underline">
          Dashboard
        </Link>
      </div>
      <WritingPractice />
    </div>
  );
}
