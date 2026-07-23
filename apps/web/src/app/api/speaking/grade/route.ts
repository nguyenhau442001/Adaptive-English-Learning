import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getActiveExam } from '@/lib/data/exam';
import { getAnthropicClient, GRADING_MODEL } from '@/lib/anthropic';

interface RubricScores {
  pronunciation: number;
  intonation: number;
  grammar: number;
  vocabulary: number;
  cohesion: number;
  relevance: number;
}

const RUBRIC_PROMPT = (taskType: string, prompt: string, transcript: string) => `You are an ETS-certified TOEIC Speaking rater. Grade the following response using the official 6-criterion analytic rubric, each scored 0-5 (whole numbers only, following ETS band descriptors — 5 = fully effective, 0 = no attempt/irrelevant):

1. pronunciation — clarity and accuracy of individual sounds
2. intonation — stress, rhythm, and pitch patterns appropriate to meaning
3. grammar — accuracy and range of grammatical structures
4. vocabulary — appropriateness and range of word choice
5. cohesion — logical organization and use of cohesive devices (transitions, referencing)
6. relevance — how directly and completely the response addresses the task prompt

Task type: ${taskType}
Task prompt: ${prompt}
Candidate's transcript (from speech-to-text, so ignore transcription artifacts like missing punctuation): ${transcript}

Respond with strict JSON only, no markdown fences, in this exact shape:
{"rubric_scores": {"pronunciation": <0-5>, "intonation": <0-5>, "grammar": <0-5>, "vocabulary": <0-5>, "cohesion": <0-5>, "relevance": <0-5>}, "feedback": "<specific, actionable feedback tied to the criteria above, 3-5 sentences, naming concrete phrases from the transcript where relevant>"}`;

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
  };

  if (!body.transcript?.trim()) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 });
  }

  const exam = await getActiveExam(supabase);
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: GRADING_MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: RUBRIC_PROMPT(body.taskType, body.prompt, body.transcript) }],
  });

  const text = response.content.find((b) => b.type === 'text')?.text ?? '{}';
  let parsed: { rubric_scores: RubricScores; feedback: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Grading response was not valid JSON' }, { status: 502 });
  }

  const { data: attempt, error } = await supabase
    .from('speaking_attempts')
    .insert({
      user_id: user.id,
      exam_id: exam.id,
      task_type: body.taskType,
      audio_url: body.audioUrl ?? null,
      transcript: body.transcript,
      rubric_scores: parsed.rubric_scores,
      ai_feedback: parsed.feedback,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attempt });
}
