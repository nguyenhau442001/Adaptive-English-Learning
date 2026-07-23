'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { getActiveExam } from '@/lib/data/exam';

// Onboarding gate (architecture principle 4): words marked "known" here get
// is_known_at_onboarding = true and next_review_at left null, so they never
// enter the SRS queue. Only words marked "not sure" get a real next_review_at
// and start the SM-2 ladder. Nothing is forced into review by default.
export async function bulkMarkOnboarding(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const exam = await getActiveExam(supabase);

  const knownIds = formData.getAll('known').map(String);
  const unsureIds = formData.getAll('unsure').map(String);

  const now = new Date().toISOString();

  const knownRows = knownIds.map((wordId) => ({
    user_id: user.id,
    word_id: wordId,
    exam_id: exam.id,
    is_known_at_onboarding: true,
    next_review_at: null,
  }));

  const unsureRows = unsureIds.map((wordId) => ({
    user_id: user.id,
    word_id: wordId,
    exam_id: exam.id,
    is_known_at_onboarding: false,
    next_review_at: now, // due immediately — enters the SRS queue right away
  }));

  const rows = [...knownRows, ...unsureRows];
  if (rows.length > 0) {
    const { error } = await supabase
      .from('user_progress')
      .upsert(rows, { onConflict: 'user_id,word_id,exam_id' });

    if (error) {
      throw new Error(`Failed to save onboarding progress: ${error.message}`);
    }
  }

  revalidatePath('/');
  revalidatePath('/onboarding');
}
