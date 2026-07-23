import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { getActiveExam } from '@/lib/data/exam';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface ErrorTypeAggregate {
  errorType: string;
  skills: Set<string>;
  count7d: number;
  count30d: number;
  latestNote: string | null;
}

export default async function WeaknessMapPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const exam = await getActiveExam(supabase);

  const since30d = new Date(new Date().getTime() - THIRTY_DAYS_MS).toISOString();

  const { data: logs } = await supabase
    .from('weakness_logs')
    .select('error_type, skill, note, created_at')
    .eq('user_id', user.id)
    .eq('exam_id', exam.id)
    .gte('created_at', since30d)
    .order('created_at', { ascending: false });

  const rows = logs ?? [];
  const now = new Date().getTime();

  // Aggregate by the specific error_type (architecture principle 5: never
  // just pass/fail or Part number) so recurring trap categories surface
  // instead of a bare accuracy score.
  const byErrorType = new Map<string, ErrorTypeAggregate>();
  for (const row of rows) {
    const existing = byErrorType.get(row.error_type) ?? {
      errorType: row.error_type,
      skills: new Set<string>(),
      count7d: 0,
      count30d: 0,
      latestNote: null,
    };
    existing.skills.add(row.skill);
    existing.count30d += 1;
    if (now - new Date(row.created_at).getTime() <= SEVEN_DAYS_MS) {
      existing.count7d += 1;
    }
    if (existing.latestNote === null && row.note) {
      existing.latestNote = row.note;
    }
    byErrorType.set(row.error_type, existing);
  }

  const aggregates = Array.from(byErrorType.values()).sort(
    (a, b) => b.count30d - a.count30d || b.count7d - a.count7d
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Weakness Map</h1>
        <Link href="/" className="text-sm text-blue-600 underline">
          Dashboard
        </Link>
      </div>

      <p className="mb-6 text-sm text-neutral-600">
        Every miss is tagged by the specific trap that caused it, not just a Part number or a
        pass/fail count. An error_type repeating across both windows below is the pattern worth
        drilling next.
      </p>

      {aggregates.length === 0 ? (
        <p className="text-neutral-600">
          No diagnosed mistakes in the last 30 days yet. Wrong answers in Listening/Reading
          practice and mock tests get classified here automatically.
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-3 py-2 font-medium">Error type</th>
                <th className="px-3 py-2 font-medium">Skill(s)</th>
                <th className="px-3 py-2 text-right font-medium">7d</th>
                <th className="px-3 py-2 text-right font-medium">30d</th>
              </tr>
            </thead>
            <tbody>
              {aggregates.map((agg) => (
                <tr key={agg.errorType} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3 py-2">
                    <p className="font-medium">{formatErrorType(agg.errorType)}</p>
                    {agg.latestNote && (
                      <p className="mt-1 text-xs text-neutral-500">{agg.latestNote}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-neutral-600">
                    {Array.from(agg.skills).join(', ')}
                  </td>
                  <td
                    className={`px-3 py-2 text-right ${
                      agg.count7d >= 2 ? 'font-semibold text-red-700' : ''
                    }`}
                  >
                    {agg.count7d}
                  </td>
                  <td className="px-3 py-2 text-right">{agg.count30d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatErrorType(errorType: string): string {
  return errorType
    .split('_')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}
