import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { getActiveExam } from '@/lib/data/exam';
import { ReviewSession } from './review-session';

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; context?: string }>;
}) {
  const { skill, context } = await searchParams;
  const user = await requireUser();
  const supabase = await createClient();
  const exam = await getActiveExam(supabase);

  // Primary SRS query: due words for this user, this exam. next_review_at
  // IS NOT NULL is enforced by the DB's partial index; here we additionally
  // filter to <= now so "due" actually means due, not "ever queued".
  const { data: due } = await supabase
    .from('user_progress')
    .select('id, word_id, next_review_at, words(id, term, ipa, meanings, examples)')
    .eq('user_id', user.id)
    .eq('exam_id', exam.id)
    .not('next_review_at', 'is', null)
    .lte('next_review_at', new Date().toISOString())
    .order('next_review_at', { ascending: true })
    .limit(50);

  let items = (due ?? []).filter((d) => d.words !== null);

  // Optional skill/context filter: look up matching word_tags and intersect.
  if (skill || context) {
    let tagQuery = supabase.from('word_tags').select('word_id').eq('exam_id', exam.id);
    if (skill) tagQuery = tagQuery.eq('skill', skill);
    if (context) tagQuery = tagQuery.eq('context', context);
    const { data: matchingTags } = await tagQuery;
    const allowedWordIds = new Set((matchingTags ?? []).map((t) => t.word_id));
    items = items.filter((d) => allowedWordIds.has(d.word_id));
  }

  const { data: skillOptions } = await supabase
    .from('word_tags')
    .select('skill')
    .eq('exam_id', exam.id);
  const { data: contextOptions } = await supabase
    .from('word_tags')
    .select('context')
    .eq('exam_id', exam.id);

  const skills = Array.from(new Set((skillOptions ?? []).map((s) => s.skill)));
  const contexts = Array.from(
    new Set((contextOptions ?? []).map((c) => c.context).filter((c): c is string => !!c))
  );

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Review</h1>
        <Link href="/" className="text-sm text-blue-600 underline">
          Dashboard
        </Link>
      </div>

      <form className="mb-6 flex gap-3 text-sm" method="get">
        <select name="skill" defaultValue={skill ?? ''} className="rounded border border-neutral-300 px-2 py-1">
          <option value="">All skills</option>
          {skills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="context"
          defaultValue={context ?? ''}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          <option value="">All contexts</option>
          {contexts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded border border-neutral-300 px-3 py-1">
          Filter
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-neutral-600">
          Nothing due right now. No streaks to keep, no forced daily quota — come back whenever
          you like.
        </p>
      ) : (
        <ReviewSession items={items as never} />
      )}
    </div>
  );
}
