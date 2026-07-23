import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { WritingPractice } from './writing-practice';

export default async function WritingPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Writing Practice</h1>
        <Link href="/" className="text-sm text-blue-600 underline">
          Dashboard
        </Link>
      </div>
      <WritingPractice />
    </div>
  );
}
