export type SpeakingTask = {
  type:
    | 'read_aloud'
    | 'describe_picture'
    | 'respond_questions'
    | 'respond_using_information'
    | 'express_opinion';
  questionRange: string;
  label: string;
  directions: string;
  prompt: string;
  officialTiming: string;
  maxScore: 3 | 5;
  information?: { heading: string; rows: string[][] };
  image?: string;
};

// Original practice material following the current ETS TOEIC Speaking task
// sequence. It is deliberately not copied from a released ETS test.
export const SPEAKING_TASKS: readonly SpeakingTask[] = [
  {
    type: 'read_aloud',
    questionRange: 'Questions 1–2',
    label: 'Read a text aloud',
    directions: 'Read the text aloud as clearly and naturally as you can.',
    prompt:
      'Thank you for visiting the Westbridge Business Center. The information desk on the first floor can help you reserve a meeting room, arrange transportation, or contact a local restaurant. Please remember that visitor parking is available behind the building until nine o’clock this evening.',
    officialTiming: '45 seconds to prepare · 45 seconds to speak',
    maxScore: 3,
  },
  {
    type: 'describe_picture',
    questionRange: 'Questions 3–4',
    label: 'Describe a picture',
    directions: 'Describe the picture in as much detail as you can.',
    prompt:
      'Describe the people, their actions, the objects, and the setting. Organize your response from the main scene to supporting details.',
    officialTiming: '45 seconds to prepare · 30 seconds to speak',
    maxScore: 3,
    image: '/toeic-office-scene.svg',
  },
  {
    type: 'respond_questions',
    questionRange: 'Questions 5–7',
    label: 'Respond to questions',
    directions:
      'Imagine that a market research company is conducting a telephone survey about commuting to work. Answer the question fully.',
    prompt:
      'What is your usual way of getting to work or school, and what is one advantage of using that form of transportation?',
    officialTiming: '3 seconds to prepare · 15/15/30 seconds to speak',
    maxScore: 3,
  },
  {
    type: 'respond_using_information',
    questionRange: 'Questions 8–10',
    label: 'Use information provided',
    directions:
      'A caller is asking about the schedule below. Answer accurately in your own words using the information provided.',
    prompt:
      'I cannot arrive before noon. Could you tell me which afternoon sessions are available, who will lead them, and where they will take place?',
    officialTiming: '45 seconds to read · 3 seconds to prepare · 15/15/30 seconds to speak',
    maxScore: 3,
    information: {
      heading: 'Green Workplace Workshop — Friday, September 18',
      rows: [
        ['Time', 'Session', 'Presenter', 'Room'],
        ['9:00 A.M.', 'Reducing Office Waste', 'Mina Patel', 'Hall A'],
        ['11:00 A.M.', 'Energy-Saving Equipment', 'Daniel Cho', 'Hall B'],
        ['1:30 P.M.', 'Sustainable Purchasing', 'Olivia Martin', 'Hall A'],
        ['3:15 P.M.', 'Employee Travel Programs', 'Marcus Lee', 'Hall C'],
      ],
    },
  },
  {
    type: 'express_opinion',
    questionRange: 'Question 11',
    label: 'Express an opinion',
    directions:
      'State your opinion clearly and support it with reasons, details, or examples.',
    prompt:
      'Some employers provide professional training during working hours, while others expect employees to study outside work. Which approach is more beneficial to a company? Give reasons and examples to support your opinion.',
    officialTiming: '45 seconds to prepare · 60 seconds to speak',
    maxScore: 5,
  },
] as const;

export type SpeakingTaskType = (typeof SPEAKING_TASKS)[number]['type'];
