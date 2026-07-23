'use server';

import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { getActiveExam } from '@/lib/data/exam';
import { classifyError } from '@/lib/weakness-classifier';

interface SubmitAnswerResult {
  correct: boolean;
  correctAnswer: string;
  explanation: string | null;
}

// Grades one practice question. On a wrong answer, calls Claude to classify
// the specific error_type and writes a WeaknessLog row — this is the "sai ->
// tự tạo WeaknessLog" pipeline from the product brief (architecture
// principle 5: tag by error type, not just pass/fail).
export async function submitAnswer(
  questionId: string,
  userAnswer: string
): Promise<SubmitAnswerResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const exam = await getActiveExam(supabase);

  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (error || !question) {
    throw new Error(`Question not found: ${error?.message}`);
  }

  const correct = userAnswer === question.correct_answer;

  if (!correct) {
    const content = question.content as {
      questionText: string;
      passage?: string;
      choices: string[];
    };

    const { errorType, note } = await classifyError({
      questionText: content.questionText,
      passage: content.passage,
      choices: content.choices,
      correctAnswer: question.correct_answer,
      userAnswer,
      explanation: question.explanation ?? undefined,
    });

    const skill = question.part.toLowerCase().includes('listening') ? 'listening' : 'reading';

    await supabase.from('weakness_logs').insert({
      user_id: user.id,
      exam_id: exam.id,
      skill,
      error_type: errorType,
      related_question_id: question.id,
      note,
    });
  }

  return {
    correct,
    correctAnswer: question.correct_answer,
    explanation: question.explanation,
  };
}
