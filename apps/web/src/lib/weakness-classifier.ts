import { getAnthropicClient, GRADING_MODEL } from '@/lib/anthropic';
import { TOEIC_ERROR_TYPES } from '@aelearning/exam-profile-toeic';

interface ClassifyInput {
  questionText: string;
  passage?: string;
  choices: string[];
  correctAnswer: string;
  userAnswer: string;
  explanation?: string;
}

interface ClassifyResult {
  errorType: string;
  note: string;
}

// Classifies a wrong answer into a specific TOEIC error_type (not just
// "wrong") so it can feed the Weakness Map (architecture principle 5).
// Falls back to a generic bucket if the model call fails — a missing
// classification should never block recording that the user got it wrong.
export async function classifyError(input: ClassifyInput): Promise<ClassifyResult> {
  const client = getAnthropicClient();

  const prompt = `You are classifying a TOEIC test-taker's wrong answer into a specific error type for a "weakness map" feature. The candidate is already advanced (aiming for a perfect 990 score), so the error is almost always a subtle trap, not a basic vocabulary gap.

Question: ${input.questionText}
${input.passage ? `Passage/context: ${input.passage}\n` : ''}Choices: ${input.choices.join(' | ')}
Correct answer: ${input.correctAnswer}
User's answer: ${input.userAnswer}
${input.explanation ? `Official explanation: ${input.explanation}\n` : ''}

Pick exactly ONE error_type from this list that best explains why the user likely chose the wrong answer:
${TOEIC_ERROR_TYPES.join(', ')}

Respond with strict JSON only, no markdown fences: {"error_type": "<one of the values above>", "note": "<one sentence on why this trap likely caused the mistake>"}`;

  try {
    const response = await client.messages.create({
      model: GRADING_MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const parsed = JSON.parse(text) as { error_type: string; note: string };

    if (!TOEIC_ERROR_TYPES.includes(parsed.error_type as (typeof TOEIC_ERROR_TYPES)[number])) {
      throw new Error(`Model returned unknown error_type: ${parsed.error_type}`);
    }

    return { errorType: parsed.error_type, note: parsed.note };
  } catch (err) {
    console.error('classifyError fallback:', err);
    return {
      errorType: 'paraphrase_miss',
      note: 'Auto-classification unavailable; defaulted to the most common high-band error type.',
    };
  }
}
