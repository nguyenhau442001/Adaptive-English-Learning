// Demo subset of ETS TOEIC Speaking task types. Real ETS exams have 11
// questions across more task types (read aloud, describe picture,
// respond to questions, respond using information, express an opinion);
// this covers 3 distinct types end-to-end per the product brief ("ghi âm
// tối thiểu 3 task type ETS demo").
export const SPEAKING_TASKS = [
  {
    type: 'read_aloud',
    label: 'Read a text aloud',
    prompt:
      'Please read the following text aloud, as if presenting to a group: "Welcome to the quarterly all-hands meeting. Before we begin, I want to remind everyone that the updated expense policy takes effect next Monday. Please review the attached document and direct any questions to the finance team."',
  },
  {
    type: 'describe_picture',
    label: 'Describe a picture',
    prompt:
      'Imagine you see a photo of a busy open-plan office: several people at desks with laptops, one person on a phone call, a whiteboard with a diagram in the background. Describe the picture in as much detail as you can.',
  },
  {
    type: 'respond_questions',
    label: 'Respond to questions',
    prompt:
      'Imagine a market research company is conducting a survey about workplace communication tools. Question: "What tool does your team use most for daily communication, and why do you prefer it over the alternatives?" Give a full, detailed answer.',
  },
] as const;

export type SpeakingTaskType = (typeof SPEAKING_TASKS)[number]['type'];
