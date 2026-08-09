import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getActiveExam } from '@/lib/data/exam';
import { computeTextMetrics, scoreFromThresholds, scoreSentenceLength } from '@/lib/text-metrics';
import type { WritingTaskType } from '@/app/writing/task-types';

function clamp(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function gradeWriting(
  taskType: WritingTaskType,
  prompt: string,
  submittedText: string,
  keywords: readonly string[] = [],
  requirements: readonly string[] = []
) {
  const metrics = computeTextMetrics(submittedText, prompt);
  let maxScore: 3 | 4 | 5;
  let score: number;
  const details: Record<string, number> = { word_count: metrics.wordCount };

  if (taskType === 'picture_description') {
    maxScore = 3;
    const normalized = submittedText.toLowerCase();
    const usedKeywords = keywords.filter((keyword) => normalized.includes(keyword.toLowerCase())).length;
    const oneSentence = metrics.sentenceCount === 1;
    details.keywords_used = usedKeywords;
    details.sentence_count = metrics.sentenceCount;
    if (usedKeywords === keywords.length && oneSentence && metrics.wordCount >= 6) score = 3;
    else if (usedKeywords === keywords.length && metrics.wordCount >= 4) score = 2;
    else score = 1;
  } else if (taskType === 'email_response') {
    maxScore = 4;
    const development = scoreFromThresholds(metrics.wordCount, [15, 35, 60, 85]);
    const organization = scoreFromThresholds(
      metrics.cohesiveMarkerCount + Math.min(metrics.sentenceCount, 6) * 0.45,
      [1, 2, 3.2, 4.5]
    );
    const hasRequestedQuestion = requirements.some((item) => /ask one question/i.test(item))
      ? submittedText.includes('?')
      : true;
    const taskCoverage = scoreFromThresholds(metrics.promptOverlapRatio, [0.08, 0.16, 0.26, 0.4]);
    score = clamp(development * 0.35 + organization * 0.25 + taskCoverage * 0.3 + (hasRequestedQuestion ? 0.4 : 0), 4);
    details.task_coverage_proxy = taskCoverage;
    details.organization_proxy = organization;
  } else {
    maxScore = 5;
    const development = scoreFromThresholds(metrics.wordCount, [50, 120, 220, 300]);
    const organization = scoreFromThresholds(
      metrics.cohesiveMarkerCount + Math.min(metrics.sentenceCount, 10) * 0.35,
      [1.5, 3, 5, 7]
    );
    const language = Math.round(
      (scoreSentenceLength(metrics.avgWordsPerSentence) +
        scoreFromThresholds(metrics.distinctWordRatio, [0.3, 0.4, 0.5, 0.62])) /
        2
    );
    score = clamp(development * 0.45 + organization * 0.3 + language * 0.25, 5);
    details.development_proxy = development;
    details.organization_proxy = organization;
    details.language_proxy = language;
  }

  const feedback: string[] = [`Bài viết có ${metrics.wordCount} từ trong ${metrics.sentenceCount} câu.`];
  if (taskType === 'picture_description') {
    feedback.push(
      details.keywords_used === keywords.length
        ? 'Bạn đã dùng đủ hai từ bắt buộc.'
        : 'Cần dùng đúng cả hai từ được cho; có thể biến đổi dạng từ nhưng không được bỏ sót.',
      metrics.sentenceCount === 1
        ? 'Đáp án giữ đúng yêu cầu một câu.'
        : 'Mức 3 yêu cầu đúng một câu hoàn chỉnh, phù hợp với hình và không có lỗi ngữ pháp.'
    );
  } else if (taskType === 'email_response') {
    feedback.push(
      score >= 4
        ? 'Bài có độ phát triển và tổ chức phù hợp; hãy kiểm tra lần cuối rằng từng yêu cầu trong đề đều được trả lời trực tiếp.'
        : 'Để đạt mức 4, hãy xử lý riêng từng yêu cầu, dùng nhiều câu rõ nghĩa, liên kết hợp lý và giữ giọng điệu chuyên nghiệp.'
    );
  } else {
    feedback.push(
      metrics.wordCount >= 300
        ? 'Độ dài đạt mốc thường thấy ở một bài hiệu quả; chất lượng phát triển ý vẫn quan trọng hơn việc chỉ đủ số từ.'
        : 'ETS cho biết bài hiệu quả thường có tối thiểu khoảng 300 từ; hãy phát triển lý do bằng giải thích và ví dụ cụ thể.',
      score >= 4
        ? 'Bố cục và mức phát triển đang tiến gần mô tả mức cao; hãy rà sự lặp ý và lỗi dùng từ nhỏ.'
        : 'Hãy làm rõ thesis, chia đoạn theo từng lý do và nối mỗi ví dụ trở lại lập trường chính.'
    );
  }
  feedback.push('Đây là phản hồi heuristic theo hướng rubric ETS, không phải điểm do giám khảo ETS cấp.');

  const rubric_scores = { holistic_score: score, max_score: maxScore, ...details };
  return { score, maxScore, rubric_scores, feedback: feedback.join(' ') };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    taskType: WritingTaskType;
    prompt: string;
    submittedText: string;
    keywords?: string[];
    requirements?: string[];
  };
  if (!body.submittedText?.trim()) return NextResponse.json({ error: 'submittedText is required' }, { status: 400 });

  const exam = await getActiveExam(supabase);
  const grade = gradeWriting(body.taskType, body.prompt, body.submittedText, body.keywords, body.requirements);
  const { data: attempt, error } = await supabase
    .from('writing_attempts')
    .insert({
      user_id: user.id,
      exam_id: exam.id,
      task_type: body.taskType,
      submitted_text: body.submittedText,
      rubric_scores: grade.rubric_scores,
      ai_feedback: grade.feedback,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attempt: { ...attempt, score: grade.score, max_score: grade.maxScore } });
}
