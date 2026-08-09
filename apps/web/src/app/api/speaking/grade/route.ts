import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getActiveExam } from '@/lib/data/exam';
import { computeTextMetrics, scoreFromThresholds } from '@/lib/text-metrics';
import type { SpeakingTaskType } from '@/app/speaking/task-types';

type CriterionScores = { pronunciation: number; intonation_stress: number };

function clamp(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function mapClarity(confidence: number | null) {
  return confidence === null ? 2 : scoreFromThresholds(confidence, [0.42, 0.68, 0.86, 2]);
}

function gradeSpeaking(
  taskType: SpeakingTaskType,
  prompt: string,
  transcript: string,
  confidence: number | null
) {
  const metrics = computeTextMetrics(transcript, prompt);
  const clarity = clamp(mapClarity(confidence), 3);
  let score = 0;
  const maxScore: 3 | 5 = taskType === 'express_opinion' ? 5 : 3;
  let criterionScores: CriterionScores | undefined;

  if (taskType === 'read_aloud') {
    const coverage = metrics.promptOverlapRatio;
    const pronunciation = clamp((clarity + scoreFromThresholds(coverage, [0.35, 0.65, 0.88, 2])) / 2, 3);
    const intonation_stress = clarity;
    criterionScores = { pronunciation, intonation_stress };
    score = Math.round((pronunciation + intonation_stress) / 2);
  } else if (taskType === 'express_opinion') {
    const development = scoreFromThresholds(metrics.wordCount, [10, 25, 45, 70]);
    const structure = scoreFromThresholds(
      metrics.cohesiveMarkerCount + Math.min(metrics.sentenceCount, 6) * 0.45,
      [1, 2, 3.5, 5]
    );
    const language = scoreFromThresholds(metrics.distinctWordRatio, [0.35, 0.45, 0.55, 0.68]);
    score = clamp((development * 0.45 + structure * 0.25 + language * 0.15 + (clarity / 3) * 5 * 0.15), 5);
  } else {
    const requiredWords = taskType === 'describe_picture' ? 25 : taskType === 'respond_using_information' ? 18 : 12;
    const completeness = scoreFromThresholds(metrics.wordCount / requiredWords, [0.25, 0.55, 0.9, 2]);
    const language = scoreFromThresholds(metrics.avgWordsPerSentence, [3, 6, 10, 30]);
    score = clamp(completeness * 0.5 + clarity * 0.3 + language * 0.2, 3);
  }

  const rubric_scores: Record<string, number> = {
    holistic_score: score,
    max_score: maxScore,
    delivery_proxy: clarity,
    word_count: metrics.wordCount,
    ...(criterionScores ?? {}),
  };

  const feedbackParts = [
    `Bài trả lời có ${metrics.wordCount} từ trong ${metrics.sentenceCount} câu.`,
    taskType === 'express_opinion'
      ? score >= 4
        ? 'Bạn đã phát triển lập trường khá rõ; hãy tiếp tục ưu tiên quan hệ logic giữa lý do và ví dụ.'
        : 'Để tiến gần mức 4–5, hãy nêu lập trường ngay đầu bài rồi phát triển ít nhất hai lý do bằng chi tiết hoặc ví dụ cụ thể.'
      : score >= 3
        ? 'Nội dung đủ phát triển cho yêu cầu và nhìn chung dễ theo dõi.'
        : 'Hãy trả lời trực tiếp hơn và bổ sung đủ thông tin mà câu hỏi yêu cầu.',
    confidence === null
      ? 'Không có tín hiệu âm thanh để đánh giá delivery; phần phát âm và ngữ điệu đang dùng mức trung tính.'
      : `Độ tin cậy nhận diện giọng nói là ${Math.round(confidence * 100)}%, chỉ được dùng như tín hiệu gần đúng về độ rõ.`,
    'Đây là phản hồi luyện tập tự động theo hướng rubric ETS, không phải điểm do giám khảo ETS cấp.',
  ];

  return { score, maxScore, criterionScores, rubric_scores, feedback: feedbackParts.join(' ') };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    taskType: SpeakingTaskType;
    prompt: string;
    transcript: string;
    audioUrl?: string;
    confidence?: number | null;
  };
  if (!body.transcript?.trim()) return NextResponse.json({ error: 'transcript is required' }, { status: 400 });

  const exam = await getActiveExam(supabase);
  const grade = gradeSpeaking(body.taskType, body.prompt, body.transcript, body.confidence ?? null);
  const { data: attempt, error } = await supabase
    .from('speaking_attempts')
    .insert({
      user_id: user.id,
      exam_id: exam.id,
      task_type: body.taskType,
      audio_url: body.audioUrl ?? null,
      transcript: body.transcript,
      rubric_scores: grade.rubric_scores,
      ai_feedback: grade.feedback,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    attempt: {
      ...attempt,
      score: grade.score,
      max_score: grade.maxScore,
      criterion_scores: grade.criterionScores,
    },
  });
}
