import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getActiveExam } from '@/lib/data/exam';
import { getAnthropicClient, GRADING_MODEL } from '@/lib/anthropic';

interface RubricScores {
  [key: string]: number;
  task_fulfillment: number;
  organization: number;
  grammar_vocab_range: number;
}

const RUBRIC_PROMPT = (taskType: string, prompt: string, submittedText: string) => `You are an ETS-certified TOEIC Writing rater. Grade the following response using the official 3-criterion analytic rubric, each scored 0-5 (whole numbers only, following ETS band descriptors — 5 = fully effective, 0 = no attempt/irrelevant):

1. task_fulfillment — how completely and appropriately the response addresses everything the prompt asks for
2. organization — logical structure, paragraphing, and cohesive devices appropriate to the task type
3. grammar_vocab_range — accuracy and range of grammar and vocabulary, including register appropriate to a business/email/essay context

Task type: ${taskType}
Task prompt: ${prompt}
Candidate's submission: ${submittedText}

Respond with strict JSON only, no markdown fences, in this exact shape:
{"rubric_scores": {"task_fulfillment": <0-5>, "organization": <0-5>, "grammar_vocab_range": <0-5>}, "feedback": "<specific, actionable feedback tied to the criteria above, 3-5 sentences, quoting concrete phrases from the submission where relevant>"}`;

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
    submittedText: string;
  };

  if (!body.submittedText?.trim()) {
    return NextResponse.json({ error: 'submittedText is required' }, { status: 400 });
  }

  const exam = await getActiveExam(supabase);
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: GRADING_MODEL,
    max_tokens: 800,
    messages: [
      { role: 'user', content: RUBRIC_PROMPT(body.taskType, body.prompt, body.submittedText) },
    ],
  });

  const text = response.content.find((b) => b.type === 'text')?.text ?? '{}';
  let parsed: { rubric_scores: RubricScores; feedback: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Grading response was not valid JSON' }, { status: 502 });
  }

  const { data: attempt, error } = await supabase
    .from('writing_attempts')
    .insert({
      user_id: user.id,
      exam_id: exam.id,
      task_type: body.taskType,
      submitted_text: body.submittedText,
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
