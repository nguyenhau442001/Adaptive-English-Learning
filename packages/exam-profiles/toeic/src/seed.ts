// Seeds the TOEIC exam profile: creates/updates the exam_profiles row, then
// upserts ~200 demo words + word_tags and a handful of sample questions.
// Run with: npm run seed:toeic (from repo root) or `npm run seed` here.
//
// This is the concrete proof of architecture principle 3: adding an exam is
// a data import, not a schema/code change. Adding IELTS later means writing
// a sibling packages/exam-profiles/ielts/src/seed.ts that inserts its own
// exam_profiles row and word_tags — this file is never touched.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { toeicWordSeeds } from '../data/words.seed';
import { toeicQuestionSeeds } from '../data/questions.seed';

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

async function main() {
  console.log('Seeding TOEIC exam profile...');

  const { data: exam, error: examError } = await supabase
    .from('exam_profiles')
    .upsert({ code: 'toeic', name: 'TOEIC', is_active: true }, { onConflict: 'code' })
    .select()
    .single();

  if (examError || !exam) {
    throw new Error(`Failed to upsert exam_profiles: ${examError?.message}`);
  }
  console.log(`exam_profiles: toeic -> ${exam.id}`);

  let wordCount = 0;
  let tagCount = 0;

  for (const seed of toeicWordSeeds) {
    const { data: word, error: wordError } = await supabase
      .from('words')
      .upsert(
        {
          term: seed.term,
          ipa: seed.ipa,
          meanings: seed.meanings,
          examples: seed.examples,
        },
        { onConflict: 'term' }
      )
      .select()
      .single();

    if (wordError || !word) {
      console.error(`  ! skipping "${seed.term}": ${wordError?.message}`);
      continue;
    }
    wordCount++;

    const { error: tagError } = await supabase.from('word_tags').upsert(
      {
        word_id: word.id,
        exam_id: exam.id,
        skill: seed.skill,
        context: seed.context,
        difficulty_for_exam: seed.difficultyForExam,
      },
      { onConflict: 'word_id,exam_id,skill,context' }
    );

    if (tagError) {
      console.error(`  ! word_tag failed for "${seed.term}": ${tagError.message}`);
      continue;
    }
    tagCount++;
  }

  console.log(`words upserted: ${wordCount}/${toeicWordSeeds.length}`);
  console.log(`word_tags upserted: ${tagCount}/${toeicWordSeeds.length}`);

  let questionCount = 0;
  for (const q of toeicQuestionSeeds) {
    const { error: qError } = await supabase.from('questions').insert({
      exam_id: exam.id,
      part: q.part,
      question_type: q.questionType,
      content: q.content,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      source: q.source,
      difficulty_for_exam: q.difficultyForExam,
    });

    if (qError) {
      console.error(`  ! question insert failed (${q.part}/${q.questionType}): ${qError.message}`);
      continue;
    }
    questionCount++;
  }

  console.log(`questions inserted: ${questionCount}/${toeicQuestionSeeds.length}`);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
