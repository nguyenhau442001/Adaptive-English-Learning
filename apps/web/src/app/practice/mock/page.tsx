import Link from 'next/link';
import { toeicQuestionSeeds } from '@aelearning/exam-profile-toeic';
import { MockTestSession } from './mock-test-session';

export default function MockTestPage() {
  const questions = toeicQuestionSeeds.map((question, index) => ({
    id: `local-question-${index + 1}`,
    part: question.part,
    question_type: question.questionType,
    content: question.content,
    correct_answer: question.correctAnswer,
    explanation: question.explanation,
  }));
  const listeningQuestions = questions.filter((question) => question.part.startsWith('Listening'));
  const readingQuestions = questions.filter((question) => !question.part.startsWith('Listening'));

  if (listeningQuestions.length === 0 && readingQuestions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-neutral-600">Chưa có câu hỏi cục bộ trong ngân hàng đề.</p>
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
