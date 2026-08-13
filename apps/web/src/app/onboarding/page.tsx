import Link from 'next/link';
import { toeicWordSeeds } from '@aelearning/exam-profile-toeic';
import { wordId } from '@/lib/local-learning-store';
import { OnboardingForm } from './onboarding-form';

export default function OnboardingPage() {
  const words = toeicWordSeeds.slice(0, 200).map((word) => ({
    id: wordId(word.term),
    term: word.term,
    ipa: word.ipa,
    meanings: word.meanings,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Quick vocabulary scan</h1>
        <Link href="/" className="text-sm text-blue-600 underline">Dashboard</Link>
      </div>
      <p className="mt-2 text-sm text-neutral-600">
        Mark words you already know. Only words marked &quot;not sure&quot; enter your review
        queue — nothing is scheduled for words you already know, and there&apos;s no required
        order or daily quota.
      </p>
      <OnboardingForm words={words} />
    </div>
  );
}
