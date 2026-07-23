import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getActiveExam } from '@/lib/data/exam';
import { computeTextMetrics, scoreFromThresholds, scoreSentenceLength } from '@/lib/text-metrics';

interface RubricScores {
  [key: string]: number;
  pronunciation: number;
  intonation: number;
  grammar: number;
  vocabulary: number;
  cohesion: number;
  relevance: number;
}

// No paid API involved on purpose (free to run — only Supabase's free tier
// is required). Pronunciation/intonation cannot be assessed from a text
// transcript alone; the only clarity signal available for free is the Web
// Speech API's own per-result confidence, so that's used as an honest proxy
// (with a null-confidence fallback) rather than fabricating precision.
function gradeSpeaking(prompt: string, transcript: string, confidence: number | null) {
  const metrics = computeTextMetrics(transcript, prompt);

  const pronunciation = confidence === null ? 3 : scoreFromThresholds(confidence, [0.4, 0.6, 0.75, 0.9]);
  const intonation = confidence === null ? 3 : scoreFromThresholds(confidence, [0.35, 0.55, 0.7, 0.85]);

  const grammar = scoreSentenceLength(metrics.avgWordsPerSentence);
  const vocabulary =
    metrics.wordCount < 8 ? Math.min(3, grammar) : scoreFromThresholds(metrics.distinctWordRatio, [0.4, 0.5, 0.6, 0.75]);
  const cohesion = scoreFromThresholds(
    metrics.cohesiveMarkerCount + Math.min(metrics.sentenceCount, 5) * 0.4,
    [1, 2, 3, 4]
  );
  const relevance = scoreFromThresholds(metrics.promptOverlapRatio, [0.15, 0.3, 0.45, 0.6]);

  const rubric_scores: RubricScores = {
    pronunciation,
    intonation,
    grammar,
    vocabulary,
    cohesion,
    relevance,
  };

  const feedbackParts: string[] = [];
  feedbackParts.push(
    confidence === null
      ? 'Pronunciation/intonation could not be estimated (no speech-recognition confidence available — recording may have been typed manually).'
      : `Speech-recognition confidence averaged ${(confidence * 100).toFixed(0)}% across your response, used here as a rough clarity proxy — ${
          confidence >= 0.75 ? 'the recognizer had little trouble parsing your speech.' : 'the recognizer struggled at points, which often (not always) tracks with unclear articulation.'
        }`
  );
  feedbackParts.push(
    `Average sentence length is ${metrics.avgWordsPerSentence.toFixed(1)} words across ${metrics.sentenceCount} sentence(s); ${
      grammar >= 4 ? 'well-controlled for a spoken response.' : 'very short fragments or long run-ons are common traps here — aim for complete, moderate-length sentences.'
    }`
  );
  feedbackParts.push(
    relevance >= 4
      ? 'Response stays closely tied to the task prompt\'s own key terms.'
      : 'Response uses few of the prompt\'s key terms — make sure you\'re directly answering what was asked.'
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
    taskType: string;
    prompt: string;
    transcript: string;
    audioUrl?: string;
    confidence?: number | null;
  };

  if (!body.transcript?.trim()) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 });
  }

  const exam = await getActiveExam(supabase);
  const { rubric_scores, feedback } = gradeSpeaking(
    body.prompt,
    body.transcript,
    body.confidence ?? null
  );

  const { data: attempt, error } = await supabase
    .from('speaking_attempts')
    .insert({
      user_id: user.id,
      exam_id: exam.id,
      task_type: body.taskType,
      audio_url: body.audioUrl ?? null,
      transcript: body.transcript,
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
