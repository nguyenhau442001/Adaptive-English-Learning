// CLI entrypoint for seeding the TOEIC exam profile. Run with:
// npm run seed:toeic (from repo root) or `npm run seed` here.
// The actual upsert logic lives in seed-logic.ts, shared with the web app's
// one-click "Seed TOEIC content" admin route so a terminal isn't the only
// way to load starter content.
//
// This is the concrete proof of architecture principle 3: adding an exam is
// a data import, not a schema/code change. Adding IELTS later means writing
// a sibling packages/exam-profiles/ielts/src/seed.ts that inserts its own
// exam_profiles row and word_tags — this file is never touched.
// `npm run seed --workspace=...` (how the root `seed:toeic` script invokes
// this) runs with cwd set to this package's own directory, not the repo
// root, so plain `dotenv/config` would look for a .env next to this file
// and miss the repo-root one. Resolve the path explicitly instead so a
// single root .env works regardless of how this script is invoked.
import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, '../../../../.env') });
import { seedToeicContent } from './seed-logic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY env vars.\n' +
      'Seeding requires the service role key because word_tags/questions inserts bypass RLS by design (content import, not user data).'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

seedToeicContent(supabase, (line) => console.log(line)).catch((err) => {
  console.error(err);
  process.exit(1);
});
