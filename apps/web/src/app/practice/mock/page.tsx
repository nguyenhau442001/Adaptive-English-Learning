import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { getActiveExam } from '@/lib/data/exam';
import { MockTestSession } from './mock-test-session';

export default async function MockTestPage() {
  await requireUser();
  const supabase = await createClient();
  const exam = await getActiveExam(supabase);

  const { data: listening } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', exam.id)
    .ilike('part', 'Listening%');

  const { data: reading } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', exam.id)
    .not('part', 'ilike', 'Listening%');

  const listeningQuestions = listening ?? [];
  const readingQuestions = reading ?? [];

  if (listeningQuestions.length === 0 && readingQuestions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-neutral-600">No seeded questions found. Run the seed script first.</p>
        <Link href="/practice" className="mt-4 inline-block text-blue-600 underline">
          Back to practice
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <MockTestSession listening={listeningQuestions as never} reading={readingQuestions as never} />
    </div>
  );
}
