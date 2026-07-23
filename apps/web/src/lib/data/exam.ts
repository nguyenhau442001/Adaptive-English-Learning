import type { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import type { Database } from '@/lib/supabase/database.types';

// Single-user, TOEIC-only today. Reading the "active" exam by code (not a
// hardcoded UUID) keeps this the only place that would need updating if the
// app ever needs to switch which exam is "current" for the user, and adding
// IELTS later never touches this function's shape.
export async function getActiveExamOrNull(supabase: SupabaseClient<Database>) {
  const { data } = await supabase
    .from('exam_profiles')
    .select('*')
    .eq('code', 'toeic')
    .eq('is_active', true)
    .maybeSingle();
  return data;
}

// Every page except the dashboard uses this: before content is seeded,
// there's no exam_profiles row yet, so instead of crashing every page with
// an error, send the user back to '/' where the one-click "load starter
// content" button lives (dashboard uses getActiveExamOrNull directly since
// redirecting to itself would loop).
export async function getActiveExam(supabase: SupabaseClient<Database>) {
  const exam = await getActiveExamOrNull(supabase);
  if (!exam) {
    redirect('/');
  }
  return exam;
}
