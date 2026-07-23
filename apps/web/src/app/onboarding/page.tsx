import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { getActiveExam } from '@/lib/data/exam';
import { OnboardingForm } from './onboarding-form';

export default async function OnboardingPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const exam = await getActiveExam(supabase);

  // Words this user hasn't triaged yet for this exam: no user_progress row
  // at all. Cap at 200 per screen — matches the seed set size and keeps the
  // bulk-mark form manageable; onboarding isn't meant to be exhaustive.
  const { data: existingProgress } = await supabase
    .from('user_progress')
    .select('word_id')
    .eq('user_id', user.id)
    .eq('exam_id', exam.id);

  const seenWordIds = new Set((existingProgress ?? []).map((p) => p.word_id));

  const { data: taggedWords } = await supabase
    .from('word_tags')
    .select('word_id, skill, context, words(id, term, ipa, meanings)')
    .eq('exam_id', exam.id)
    .limit(400);

  const candidates = (taggedWords ?? [])
    .filter((t) => !seenWordIds.has(t.word_id))
    .map((t) => t.words)
    .filter((w): w is NonNullable<typeof w> => w !== null);

  // De-dupe (a word can carry multiple tags/rows above)
  const uniqueWords = Array.from(new Map(candidates.map((w) => [w.id, w])).values()).slice(
    0,
    200
  );

  if (uniqueWords.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Onboarding complete</h1>
        <p className="mt-2 text-neutral-600">
          You&apos;ve triaged every seeded word. Head to your review queue.
        </p>
        <Link href="/review" className="mt-4 inline-block text-blue-600 underline">
          Go to review
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Quick vocabulary scan</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Mark words you already know. Only words marked &quot;not sure&quot; enter your review
        queue — nothing is scheduled for words you already know, and there&apos;s no required
        order or daily quota.
      </p>
      <OnboardingForm words={uniqueWords} />
    </div>
  );
}
