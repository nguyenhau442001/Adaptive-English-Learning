import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

// Single-user, TOEIC-only today. Reading the "active" exam by code (not a
// hardcoded UUID) keeps this the only place that would need updating if the
// app ever needs to switch which exam is "current" for the user, and adding
// IELTS later never touches this function's shape.
export async function getActiveExam(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('exam_profiles')
    .select('*')
    .eq('code', 'toeic')
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error(
      `No active TOEIC exam profile found — run the seed script first (npm run seed:toeic). ${error?.message ?? ''}`
    );
  }
  return data;
}
