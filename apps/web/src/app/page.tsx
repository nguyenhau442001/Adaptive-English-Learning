import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { getActiveExamOrNull } from '@/lib/data/exam';
import { SeedContentButton } from './seed-content-button';

const NAV_LINKS = [
  { href: '/onboarding', label: 'Onboarding scan', desc: 'Bulk-mark words you already know' },
  { href: '/review', label: 'Vocab review', desc: 'SRS queue — only what you actually got wrong' },
  { href: '/practice', label: 'Listening & Reading', desc: 'Filter by question type, focus on traps' },
  { href: '/practice/mock', label: 'Full mock test', desc: 'Timed Listening + Reading' },
  { href: '/speaking', label: 'Speaking', desc: '3 ETS task types, AI rubric feedback' },
  { href: '/writing', label: 'Writing', desc: '3 ETS task types, AI rubric feedback' },
  { href: '/weakness', label: 'Weakness Map', desc: 'Recurring error patterns, 7d vs 30d' },
] as const;

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const exam = await getActiveExamOrNull(supabase);

  if (!exam) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Adaptive English Learning</h1>
          <p className="text-sm text-neutral-500">TOEIC prep — band 990 target.</p>
        </div>
        <SeedContentButton />
      </div>
    );
  }

  // Total distinct words tagged for this exam (dedupe in JS since a word can
  // carry multiple word_tags rows — same pattern as onboarding/page.tsx).
  const { data: taggedWords } = await supabase
    .from('word_tags')
    .select('word_id')
    .eq('exam_id', exam.id);
  const totalWords = new Set((taggedWords ?? []).map((t) => t.word_id)).size;

  const { data: progress } = await supabase
    .from('user_progress')
    .select('is_known_at_onboarding, next_review_at')
    .eq('user_id', user.id)
    .eq('exam_id', exam.id);

  const rows = progress ?? [];
  const known = rows.filter((r) => r.is_known_at_onboarding).length;
  const learning = rows.filter((r) => !r.is_known_at_onboarding && r.next_review_at !== null).length;
  const due = rows.filter(
    (r) => r.next_review_at !== null && new Date(r.next_review_at) <= new Date()
  ).length;
  // "New" = tagged words this user hasn't triaged at all yet (no user_progress row).
  const newCount = Math.max(0, totalWords - rows.length);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Adaptive English Learning</h1>
        <p className="text-sm text-neutral-500">{exam.name} prep — band 990 target.</p>
      </div>

      <section className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Known" value={known} />
        <StatCard label="Learning" value={learning} />
        <StatCard label="New" value={newCount} />
        <StatCard label="Due now" value={due} highlight={due > 0} />
      </section>
      <p className="mb-10 -mt-6 text-xs text-neutral-500">
        No streaks, no daily quota — these numbers are just where things stand.
      </p>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded border border-neutral-200 p-4 hover:border-neutral-400"
          >
            <p className="font-medium">{link.label}</p>
            <p className="text-sm text-neutral-500">{link.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded border p-4 text-center ${
        highlight ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'
      }`}
    >
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
