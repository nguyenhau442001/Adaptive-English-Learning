'use server';

import { revalidatePath } from 'next/cache';
import { applySrsGrade, type SrsGrade } from '@aelearning/vocab-core';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';

export async function submitReview(progressId: string, grade: SrsGrade) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: progress, error: fetchError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('id', progressId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !progress) {
    throw new Error(`Progress row not found: ${fetchError?.message}`);
  }

  const result = applySrsGrade(
    {
      intervalDays: progress.interval_days,
      easeFactor: progress.ease_factor,
      repetitions: progress.repetitions,
      lapses: progress.lapses,
    },
    grade
  );

  const { error: updateError } = await supabase
    .from('user_progress')
    .update({
      interval_days: result.intervalDays,
      ease_factor: result.easeFactor,
      repetitions: result.repetitions,
      lapses: result.lapses,
      last_reviewed_at: new Date().toISOString(),
      next_review_at: result.nextReviewAt.toISOString(),
    })
    .eq('id', progressId)
    .eq('user_id', user.id);

  if (updateError) {
    throw new Error(`Failed to update SRS state: ${updateError.message}`);
  }

  revalidatePath('/review');
  revalidatePath('/progress');
}
