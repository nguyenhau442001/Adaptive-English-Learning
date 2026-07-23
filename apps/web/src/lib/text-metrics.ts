// Rule-based text heuristics used to grade Speaking/Writing attempts and to
// classify wrong-answer error types, without calling any paid API — this app
// runs entirely on free-tier infrastructure (Supabase) plus the browser's
// own Web Speech API for STT.
//
// These are proxies, not real NLP/ASR analysis. They cannot replace a human
// or an LLM rater; they exist to give directionally useful, explainable
// feedback for free. Each proxy is named after what it actually measures.

const COHESIVE_MARKERS = [
  'however',
  'therefore',
  'moreover',
  'furthermore',
  'in addition',
  'first',
  'second',
  'finally',
  'because',
  'since',
  'although',
  'in conclusion',
  'for example',
  'as a result',
  'on the other hand',
  'in contrast',
  'also',
  'then',
];

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'as', 'that', 'this', 'these',
  'those', 'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they', 'them', 'his', 'her', 'our',
  'your', 'their', 'will', 'would', 'can', 'could', 'should', 'do', 'does', 'did', 'not',
  'if', 'so', 'than', 'then', 'there', 'have', 'has', 'had', 'about',
]);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .match(/[a-z']+/g) ?? [];
}

function contentWords(text: string): Set<string> {
  return new Set(words(text).filter((w) => !STOPWORDS.has(w) && w.length > 2));
}

export interface TextMetrics {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  distinctWordRatio: number; // type-token ratio: vocabulary range proxy
  cohesiveMarkerCount: number; // organization/cohesion proxy
  promptOverlapRatio: number; // task-relevance proxy: shared content words with the prompt
}

export function computeTextMetrics(responseText: string, promptText: string): TextMetrics {
  const responseWords = words(responseText);
  const wordCount = responseWords.length;

  const sentences = responseText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentenceCount = sentences.length;

  const distinctWords = new Set(responseWords);
  const distinctWordRatio = wordCount === 0 ? 0 : distinctWords.size / wordCount;

  const lowerResponse = responseText.toLowerCase();
  const cohesiveMarkerCount = COHESIVE_MARKERS.filter((m) => lowerResponse.includes(m)).length;

  const promptContentWords = contentWords(promptText);
  const responseContentWords = contentWords(responseText);
  const overlap = [...promptContentWords].filter((w) => responseContentWords.has(w));
  const promptOverlapRatio =
    promptContentWords.size === 0 ? 0 : overlap.length / promptContentWords.size;

  return {
    wordCount,
    sentenceCount,
    avgWordsPerSentence: sentenceCount === 0 ? 0 : wordCount / sentenceCount,
    distinctWordRatio,
    cohesiveMarkerCount,
    promptOverlapRatio,
  };
}

/** Maps a value to a 0-5 score using ascending thresholds for scores 1-5. */
export function scoreFromThresholds(value: number, thresholds: [number, number, number, number]): number {
  const [t1, t2, t3, t4] = thresholds;
  if (value >= t4) return 5;
  if (value >= t3) return 4;
  if (value >= t2) return 3;
  if (value >= t1) return 2;
  if (value > 0) return 1;
  return 0;
}

/**
 * ETS-appropriate sentence length peaks around 10-22 words; very short
 * "sentences" (fragments) or very long run-ons both score lower. Returns 0-5.
 */
export function scoreSentenceLength(avgWordsPerSentence: number): number {
  if (avgWordsPerSentence <= 0) return 0;
  if (avgWordsPerSentence < 5) return 2;
  if (avgWordsPerSentence < 8) return 3;
  if (avgWordsPerSentence <= 22) return 5;
  if (avgWordsPerSentence <= 30) return 3;
  return 2;
}
