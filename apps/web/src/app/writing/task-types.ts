export type WritingTask = {
  type: 'picture_description' | 'email_response' | 'opinion_essay';
  questionRange: string;
  label: string;
  directions: string;
  prompt: string;
  officialTiming: string;
  maxScore: 3 | 4 | 5;
  recommendedWords?: number;
  image?: string;
  keywords?: readonly string[];
  email?: { from: string; to: string; subject: string; body: string };
  requirements?: readonly string[];
};

// Original practice material following the current ETS TOEIC Writing task
// sequence. It is deliberately not copied from a released ETS test.
export const WRITING_TASKS: readonly WritingTask[] = [
  {
    type: 'picture_description',
    questionRange: 'Questions 1–5',
    label: 'Write a sentence based on a picture',
    directions:
      'Write ONE sentence about the picture. You must use both words below. You may change their forms and use them in any order.',
    prompt: 'Describe the office scene in one complete sentence.',
    officialTiming: '8 minutes for all 5 questions',
    maxScore: 3,
    image: '/toeic-office-scene.svg',
    keywords: ['while', 'document'],
  },
  {
    type: 'email_response',
    questionRange: 'Questions 6–7',
    label: 'Respond to a written request',
    directions: 'Read the email, then write a professional response that completes every requirement.',
    prompt: 'Respond as the training coordinator.',
    officialTiming: '10 minutes for each email',
    maxScore: 4,
    recommendedWords: 80,
    email: {
      from: 'Nora Kim <n.kim@example.com>',
      to: 'Training Coordinator',
      subject: 'Customer service workshop',
      body:
        'I would like to attend next month’s customer service workshop, but I could not find the location or starting time on the registration page. I also have a food allergy. Could you send me the missing details and let me know whom I should contact about lunch?',
    },
    requirements: [
      'Provide the workshop location and starting time.',
      'Explain whom Nora should contact about her food allergy.',
      'Ask ONE question to confirm her registration.',
    ],
  },
  {
    type: 'opinion_essay',
    questionRange: 'Question 8',
    label: 'Write an opinion essay',
    directions:
      'State, explain, and support your opinion. Use reasons and specific examples, and organize the essay clearly.',
    prompt:
      'Do you agree or disagree with the following statement? Companies should allow employees to choose their own starting and finishing times. Give reasons or examples to support your opinion.',
    officialTiming: '30 minutes to plan, write, and revise',
    maxScore: 5,
    recommendedWords: 300,
  },
] as const;

export type WritingTaskType = (typeof WRITING_TASKS)[number]['type'];
