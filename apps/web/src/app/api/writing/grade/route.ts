import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getActiveExam } from '@/lib/data/exam';
import { computeTextMetrics, scoreFromThresholds, scoreSentenceLength } from '@/lib/text-metrics';
import { WRITING_TASKS, type WritingTaskType } from '@/app/writing/task-types';

interface RubricScores {
  [key: string]: number;
  task_fulfillment: number;
  organization: number;
  grammar_vocab_range: number;
}

// No paid API involved on purpose (this app is free to run — only Supabase's
// free tier is required). These are rule-based proxies for the ETS 3-criterion
// analytic rubric, not real NLP grading — see lib/text-metrics.ts.
function gradeWriting(taskType: WritingTaskType, prompt: string, submittedText: string) {
  const task = WRITING_TASKS.find((t) => t.type === taskType);
  const minWords = task?.minWords ?? 30;
  const metrics = computeTextMetrics(submittedText, prompt);

  const lengthRatio = metrics.wordCount / minWords;
  const lengthScore = scoreFromThresholds(lengthRatio, [0.3, 0.6, 0.9, 1.2]);
  const overlapScore = scoreFromThresholds(metrics.promptOverlapRatio, [0.15, 0.3, 0.45, 0.6]);
  const task_fulfillment = Math.round((lengthScore + overlapScore) / 2);

  // Short tasks (e.g. picture description, minWords <= 10) only need one
  // well-formed sentence — cohesive-marker density isn't a meaningful signal
  // at that length, so organization there just checks for a complete sentence.
  const organization =
    minWords <= 10
      ? metrics.sentenceCount >= 1 && metrics.wordCount >= 5
        ? 4
        : metrics.wordCount > 0
          ? 2
          : 0
      : scoreFromThresholds(
          metrics.cohesiveMarkerCount + Math.min(metrics.sentenceCount, 5) * 0.4,
          [1, 2, 3, 4]
        );

  const grammarScore = scoreSentenceLength(metrics.avgWordsPerSentence);
  // Type-token ratio is unreliable on very short text (naturally close to 1),
  // so cap the vocabulary score until there's enough text to be meaningful.
  const vocabScore =
    metrics.wordCount < 8 ? Math.min(3, grammarScore) : scoreFromThresholds(metrics.distinctWordRatio, [0.4, 0.5, 0.6, 0.75]);
  const grammar_vocab_range = Math.round((grammarScore + vocabScore) / 2);

  const rubric_scores: RubricScores = { task_fulfillment, organization, grammar_vocab_range };

  const feedbackParts: string[] = [];
  feedbackParts.push(
    lengthRatio >= 1
      ? `Length is on target (${metrics.wordCount} words, minimum ${minWords}).`
      : `Response is short: ${metrics.wordCount} words vs. a ${minWords}-word minimum — this alone caps Task Fulfillment.`
  );
  feedbackParts.push(
    metrics.promptOverlapRatio >= 0.3
      ? 'Good use of the prompt\'s own key terms, which signals the response is on-topic.'
      : 'Few of the prompt\'s key terms appear in the response — check it directly addresses everything asked.'
  );
  feedbackParts.push(
    `Average sentence length is ${metrics.avgWordsPerSentence.toFixed(1)} words across ${metrics.sentenceCount} sentence(s); ${
      grammarScore >= 4 ? 'this is in the range typical of clear, well-controlled writing.' : 'very short or very long sentences often signal fragments or run-ons — vary sentence length deliberately.'
    }`
  );
  feedbackParts.push(
    `Vocabulary range (distinct/total word ratio): ${(metrics.distinctWordRatio * 100).toFixed(0)}%. ${
      vocabScore >= 4 ? 'Reasonable lexical variety.' : 'Try to avoid repeating the same words — swap in synonyms where natural.'
    }`
  );
  feedbackParts.push(
    'Automated heuristic feedback (no AI grader) — treat scores as a rough directional signal, not an official ETS rating.'
  );

  return { rubric_scores, feedback: feedbackParts.join(' ') };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    taskType: WritingTaskType;
    prompt: string;
    submittedText: string;
  };

  if (!body.submittedText?.trim()) {
    return NextResponse.json({ error: 'submittedText is required' }, { status: 400 });
  }

  const exam = await getActiveExam(supabase);
  const { rubric_scores, feedback } = gradeWriting(body.taskType, body.prompt, body.submittedText);

  const { data: attempt, error } = await supabase
    .from('writing_attempts')
    .insert({
      user_id: user.id,
      exam_id: exam.id,
      task_type: body.taskType,
      submitted_text: body.submittedText,
      rubric_scores,
      ai_feedback: feedback,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attempt });
}
