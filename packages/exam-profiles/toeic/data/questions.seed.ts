import type { ToeicQuestionSeed } from '../src/types';

// Small demonstration set of TOEIC-style practice questions covering the
// question_type values the app prioritizes for high-band learners
// (inference/paraphrase over simple detail lookup). Illustrative content
// modeled on public ETS-style formats, not reproductions of real ETS items —
// see README for the note that a real deployment needs a licensed item bank.
export const toeicQuestionSeeds: ToeicQuestionSeed[] = [
  {
    part: 'Part 5',
    questionType: 'grammar_trap',
    content: {
      questionText:
        'Having ______ the quarterly report, the finance team scheduled a meeting to discuss the discrepancies.',
      choices: ['reviewed', 'review', 'reviews', 'to review'],
    },
    correctAnswer: 'reviewed',
    explanation:
      'A perfect participial phrase ("Having + past participle") modifies the subject "the finance team" and shows an action completed before the main clause. Only "reviewed" fits the participle slot.',
    source: 'Sample item — modeled on ETS Part 5 format',
    difficultyForExam: 4,
  },
  {
    part: 'Part 5',
    questionType: 'vocabulary',
    content: {
      questionText:
        'The manager asked employees to ______ any safety concerns directly to the facilities department.',
      choices: ['raise', 'rise', 'arise', 'raised'],
    },
    correctAnswer: 'raise',
    explanation:
      '"Raise a concern" is the fixed collocation. "Rise" is intransitive (cannot take an object like "concerns"), and "arise" means to come into existence, not to voice something.',
    source: 'Sample item — modeled on ETS Part 5 format',
    difficultyForExam: 3,
  },
  {
    part: 'Part 6',
    questionType: 'paraphrase',
    content: {
      passage:
        'To Whom It May Concern,\n\nWe regret to inform you that due to an unforeseen shipping delay, your order (#48213) will not ______ (1) by the originally promised date of June 5th. We anticipate the shipment will now arrive no later than June 12th. We apologize for any inconvenience this may cause.',
      questionText: '(1)',
      choices: ['arrive', 'be arrived', 'arriving', 'have arrived'],
    },
    correctAnswer: 'arrive',
    explanation:
      '"Arrive" is intransitive and never used in the passive voice ("be arrived" is ungrammatical). The base form after modal "will not" is correct.',
    source: 'Sample item — modeled on ETS Part 6 format',
    difficultyForExam: 3,
  },
  {
    part: 'Part 7',
    questionType: 'inference',
    content: {
      passage:
        'Notice to All Staff: Beginning next Monday, the third-floor conference room will be unavailable for booking as it undergoes renovation. Staff needing meeting space during this period should reserve the second-floor annex via the shared calendar. We expect the renovation to conclude within three weeks, though this timeline may be extended if additional structural work is required.',
      questionText: 'What can be inferred about the renovation timeline?',
      choices: [
        'It is guaranteed to finish in exactly three weeks.',
        'It may take longer than three weeks depending on what is found.',
        'It has already been delayed once.',
        'It will not affect meeting room availability.',
      ],
    },
    correctAnswer: 'It may take longer than three weeks depending on what is found.',
    explanation:
      'The phrase "though this timeline may be extended if additional structural work is required" signals the three-week estimate is conditional, not guaranteed — the correct inference requires connecting that qualifier to the estimate.',
    source: 'Sample item — modeled on ETS Part 7 format',
    difficultyForExam: 4,
  },
  {
    part: 'Part 7',
    questionType: 'detail',
    content: {
      passage:
        'Effective March 1, all reimbursement requests must be submitted through the new online portal rather than by paper form. Requests submitted on paper after this date will be returned unprocessed. Employees who need assistance accessing the portal should contact IT support at extension 4420.',
      questionText: 'What happens to paper reimbursement requests submitted after March 1?',
      choices: [
        'They will be processed as usual.',
        'They will be returned without being processed.',
        'They will be forwarded to IT support.',
        'They will be automatically converted to the online format.',
      ],
    },
    correctAnswer: 'They will be returned without being processed.',
    explanation:
      'Directly stated: "Requests submitted on paper after this date will be returned unprocessed."',
    source: 'Sample item — modeled on ETS Part 7 format',
    difficultyForExam: 2,
  },
  {
    part: 'Listening Part 3',
    questionType: 'inference',
    content: {
      audioTranscript:
        'Man: Did you get a chance to look at the vendor proposals I sent over?\nWoman: I did, and honestly, the pricing on the second one seems too good to be true. Have we worked with them before?\nMan: Not that I know of. Maybe we should ask around before we commit to anything.',
      questionText: 'What does the woman imply about the second vendor?',
      choices: [
        'She thinks their pricing is fair.',
        'She is suspicious of their pricing.',
        'She has worked with them before.',
        'She wants to cancel the proposal process.',
      ],
    },
    correctAnswer: 'She is suspicious of their pricing.',
    explanation:
      '"Too good to be true" is an idiom signaling skepticism/suspicion, not approval — the correct answer requires recognizing the idiom\'s implied meaning rather than a literal reading.',
    source: 'Sample item — modeled on ETS Listening Part 3 format',
    difficultyForExam: 4,
  },
  {
    part: 'Listening Part 4',
    questionType: 'main_idea',
    content: {
      audioTranscript:
        'Good morning, everyone. Before we begin the tour, I want to remind you that hard hats are required in all production areas, and photography is not permitted on the manufacturing floor for confidentiality reasons. If you have any questions during the tour, feel free to ask our floor supervisor, who will be joining us shortly.',
      questionText: 'What is the main purpose of this announcement?',
      choices: [
        'To introduce the floor supervisor',
        'To explain safety and confidentiality rules before a facility tour',
        'To announce a delay in the tour schedule',
        'To advertise the company\'s manufacturing capabilities',
      ],
    },
    correctAnswer: 'To explain safety and confidentiality rules before a facility tour',
    explanation:
      'The speaker states rules (hard hats, no photography) "before we begin the tour" — the overall purpose is briefing visitors on rules, not any of the narrower distractor topics.',
    source: 'Sample item — modeled on ETS Listening Part 4 format',
    difficultyForExam: 3,
  },
];
