import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { getActiveExam } from '@/lib/data/exam';
import { PracticeSession } from './practice-session';

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ question_type?: string; part?: string }>;
}) {
  const { question_type, part } = await searchParams;
  await requireUser();
  const supabase = await createClient();
  const exam = await getActiveExam(supabase);

  let query = supabase.from('questions').select('*').eq('exam_id', exam.id).limit(20);
  if (question_type) query = query.eq('question_type', question_type);
  if (part) query = query.eq('part', part);

  const { data: questions } = await query;

  const { data: allQuestions } = await supabase
    .from('questions')
    .select('question_type, part')
    .eq('exam_id', exam.id);

  const questionTypes = Array.from(new Set((allQuestions ?? []).map((q) => q.question_type)));
  const parts = Array.from(new Set((allQuestions ?? []).map((q) => q.part)));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Listening &amp; Reading Practice</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/practice/mock" className="text-blue-600 underline">
            Full mock test
          </Link>
          <Link href="/" className="text-blue-600 underline">
            Dashboard
          </Link>
        </div>
      </div>

      <p className="mb-4 text-sm text-neutral-600">
        Filter by question type — inference and paraphrase are prioritized since those are the
        traps that actually cost points at high band, not simple detail lookup.
      </p>

      <form className="mb-6 flex gap-3 text-sm" method="get">
        <select
          name="question_type"
          defaultValue={question_type ?? ''}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          <option value="">All question types</option>
          {questionTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="part" defaultValue={part ?? ''} className="rounded border border-neutral-300 px-2 py-1">
          <option value="">All parts</option>
          {parts.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded border border-neutral-300 px-3 py-1">
          Filter
        </button>
      </form>

      {!questions || questions.length === 0 ? (
        <p className="text-neutral-600">
          No questions match this filter. Run the seed script to load sample content.
        </p>
      ) : (
        <PracticeSession questions={questions as never} />
      )}
    </div>
  );
}
