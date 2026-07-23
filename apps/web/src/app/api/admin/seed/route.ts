import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { seedToeicContent } from '@aelearning/exam-profile-toeic';

// One-click content loader so seeding doesn't require a terminal. Requires
// being logged in (this is a personal single-user app; that's enough of a
// gate here), and is idempotent — safe to click more than once, see
// seed-logic.ts for how questions avoid duplicating on re-seed.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.' },
      { status: 500 }
    );
  }

  const admin = createAdminClient();

  try {
    const result = await seedToeicContent(admin);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Seeding failed' },
      { status: 500 }
    );
  }
}
