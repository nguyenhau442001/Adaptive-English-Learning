import Anthropic from '@anthropic-ai/sdk';

// User-specified per the project brief; not the SDK's latest-model default.
export const GRADING_MODEL = 'claude-sonnet-4-6';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}
