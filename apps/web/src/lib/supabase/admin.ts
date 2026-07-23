import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Service-role client: bypasses RLS. Server-only — never import this from a
// client component or expose SUPABASE_SERVICE_ROLE_KEY to the browser. Used
// only by the one-click content-seeding admin route, mirroring how the
// standalone seed CLI script (packages/exam-profiles/toeic) uses the same key.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
