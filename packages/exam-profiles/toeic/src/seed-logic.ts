// Shared seeding logic, used by both the CLI script (seed.ts) and the web
// app's one-click "Seed TOEIC content" admin route — a single source of
// truth so a terminal isn't the only way to load starter content.
import type { SupabaseClient } from '@supabase/supabase-js';
import { toeicWordSeeds } from '../data/words.seed';
import { toeicQuestionSeeds } from '../data/questions.seed';

export interface SeedResult {
  examId: string;
  wordCount: number;
  tagCount: number;
  questionCount: number;
}

export async function seedToeicContent(
  supabase: SupabaseClient,
  log: (line: string) => void = () => {}
): Promise<SeedResult> {
  log('Seeding TOEIC exam profile...');

  const { data: exam, error: examError } = await supabase
    .from('exam_profiles')
    .upsert({ code: 'toeic', name: 'TOEIC', is_active: true }, { onConflict: 'code' })
    .select()
    .single();

  if (examError || !exam) {
    throw new Error(`Failed to upsert exam_profiles: ${examError?.message}`);
  }
  log(`exam_profiles: toeic -> ${exam.id}`);

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
      log(`  ! skipping "${seed.term}": ${wordError?.message}`);
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
      log(`  ! word_tag failed for "${seed.term}": ${tagError.message}`);
      continue;
    }
    tagCount++;
  }

  log(`words upserted: ${wordCount}/${toeicWordSeeds.length}`);
  log(`word_tags upserted: ${tagCount}/${toeicWordSeeds.length}`);

  // questions has no natural unique key to upsert against, so re-seeding
  // (e.g. clicking the in-app seed button more than once) replaces the
  // sample set instead of appending duplicates every click.
  await supabase.from('questions').delete().eq('exam_id', exam.id).ilike('source', 'Sample item%');

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
      log(`  ! question insert failed (${q.part}/${q.questionType}): ${qError.message}`);
      continue;
    }
    questionCount++;
  }

  log(`questions inserted: ${questionCount}/${toeicQuestionSeeds.length}`);
  log('Done.');

  return { examId: exam.id, wordCount, tagCount, questionCount };
}
