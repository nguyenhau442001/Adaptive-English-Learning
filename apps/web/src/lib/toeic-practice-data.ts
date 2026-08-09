export type ToeicPracticeQuestion = {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
};

export type ToeicPracticeSet = {
  id: string;
  skill: 'listening' | 'reading';
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  format: string;
  directions: string;
  audioScript?: string;
  hideChoiceText?: boolean;
  image?: string;
  passages?: { label?: string; text: string }[];
  questions: ToeicPracticeQuestion[];
};

// Original items modeled on the official TOEIC L&R format. These are not
// copied from ETS test forms and are safe to use as practice content.
export const TOEIC_PRACTICE_SETS: ToeicPracticeSet[] = [
  {
    id: 'l1-office', skill: 'listening', part: 1, title: 'Photographs', format: '6 questions in the official test',
    directions: 'Look at the picture. You will hear four statements. Select the statement that best describes the picture.',
    image: '/toeic-office-scene.svg', hideChoiceText: true,
    audioScript: 'A. Some people are sitting outside a building. B. A woman is handing a document to a coworker. C. Every computer has been turned off. D. Some boxes are being carried through a doorway.',
    questions: [{ question: 'Select the best description.', choices: ['Some people are sitting outside a building.', 'A woman is handing a document to a coworker.', 'Every computer has been turned off.', 'Some boxes are being carried through a doorway.'], answer: 1, explanation: 'The standing woman is handing a document to a seated coworker. This directly describes the visible action.' }],
  },
  {
    id: 'l2-response', skill: 'listening', part: 2, title: 'Question–Response', format: '25 questions in the official test',
    directions: 'You will hear a question or statement and three responses. Select the best response.', hideChoiceText: true,
    audioScript: 'When will the maintenance team inspect the elevator? A. On the third floor. B. Sometime tomorrow morning. C. Yes, it is a new elevator.',
    questions: [{ question: 'Select the best response.', choices: ['On the third floor.', 'Sometime tomorrow morning.', 'Yes, it is a new elevator.'], answer: 1, explanation: '“When” asks for a time. Only “sometime tomorrow morning” answers that information type.' }],
  },
  {
    id: 'l3-conversation', skill: 'listening', part: 3, title: 'Conversations', format: '13 conversations · 3 questions each',
    directions: 'Listen to a conversation. Read the three questions and select the best answer to each.',
    audioScript: 'Woman: Hi, Leo. The printer we ordered for the reception desk arrived, but the box contains the standard model. We paid for the wireless version. Man: I will call the supplier now. Could you take a photograph of the product label and email it to me? Woman: Sure. We need the correct printer before the new branch opens on Monday.',
    questions: [
      { question: 'What problem does the woman mention?', choices: ['A printer was delivered to the wrong branch.', 'The company received the wrong printer model.', 'A product label is missing.', 'The reception desk was damaged.'], answer: 1, explanation: 'She says they ordered the wireless version but received the standard model.' },
      { question: 'What does the man ask the woman to do?', choices: ['Call the supplier', 'Move the printer', 'Send him a photograph', 'Print a product label'], answer: 2, explanation: 'He asks her to photograph the product label and email it to him.' },
      { question: 'Why is Monday mentioned?', choices: ['A new branch will open.', 'The supplier will visit.', 'A payment is due.', 'The printer warranty ends.'], answer: 0, explanation: 'The correct printer is needed before the new branch opens on Monday.' },
    ],
  },
  {
    id: 'l4-talk', skill: 'listening', part: 4, title: 'Talks', format: '10 talks · 3 questions each',
    directions: 'Listen to a talk. Read the three questions and select the best answer to each.',
    audioScript: 'Good afternoon, passengers. Train 84 to Fairview will depart approximately twenty minutes late because of a mechanical inspection. Customers with tickets for Fairview may instead board the express train at platform six, which leaves at two forty-five. Please see a station employee if you need to exchange a reserved-seat ticket.',
    questions: [
      { question: 'Where most likely is the announcement being made?', choices: ['At a train station', 'At a repair shop', 'At a hotel', 'At a travel agency'], answer: 0, explanation: 'The announcement refers to passengers, trains, tickets, and platforms.' },
      { question: 'Why has Train 84 been delayed?', choices: ['The weather is severe.', 'A crew member is absent.', 'It requires an inspection.', 'The platform is crowded.'], answer: 2, explanation: 'The speaker directly states that a mechanical inspection caused the delay.' },
      { question: 'What are passengers traveling to Fairview advised to do?', choices: ['Request a refund online', 'Wait twenty minutes', 'Use an express train', 'Call a station employee'], answer: 2, explanation: 'They may board the express train departing from platform six.' },
    ],
  },
  {
    id: 'r5-sentences', skill: 'reading', part: 5, title: 'Incomplete Sentences', format: '30 questions in the official test',
    directions: 'Select the best word or phrase to complete the sentence.',
    questions: [
      { question: 'The revised safety guidelines will take effect _____ the beginning of next month.', choices: ['at', 'until', 'among', 'beside'], answer: 0, explanation: 'The fixed time expression is “at the beginning of.”' },
      { question: 'Customers may return unused items, provided that the original receipt is _____.', choices: ['present', 'presentation', 'presented', 'presenting'], answer: 2, explanation: 'The passive structure requires the past participle: “the receipt is presented.”' },
    ],
  },
  {
    id: 'r6-text', skill: 'reading', part: 6, title: 'Text Completion', format: '4 texts · 4 questions each',
    directions: 'Read the text. Select the best answer for each blank.',
    passages: [{ text: 'To: All Riverton Store Managers\nFrom: Operations Department\nSubject: Inventory system update\n\nOur inventory software will be unavailable on Sunday from 1:00 A.M. to 5:00 A.M. while technicians install an update. Please make sure that all Saturday sales records are _____ (1) before midnight. The new version includes a dashboard that displays stock levels more _____. (2) A short video explaining the dashboard will be posted on the staff portal. _____ (3), managers who would like additional assistance may register for an online demonstration. We expect the system to be fully operational by 5:00 A.M. _____ (4).' }],
    questions: [
      { question: '(1)', choices: ['upload', 'uploaded', 'uploading', 'uploads'], answer: 1, explanation: 'After “are,” a past participle forms the required passive voice.' },
      { question: '(2)', choices: ['clear', 'clearly', 'clearest', 'clarity'], answer: 1, explanation: 'An adverb is needed to modify “displays.”' },
      { question: '(3)', choices: ['However', 'For example', 'In addition', 'Otherwise'], answer: 2, explanation: 'The sentence adds another source of training, so “In addition” fits.' },
      { question: '(4)', choices: ['We appreciate your patience during this maintenance period.', 'Last year, the stores sold several new products.', 'The staff portal requires a different password every week.', 'Some customers prefer to shop early in the morning.'], answer: 0, explanation: 'This sentence logically closes a maintenance announcement and matches its audience and purpose.' },
    ],
  },
  {
    id: 'r7-multiple', skill: 'reading', part: 7, title: 'Reading Comprehension', format: 'Single, double, and triple passages',
    directions: 'Read the documents and select the best answer to each question.',
    passages: [
      { label: 'Email', text: 'From: Elena Ruiz\nTo: Harbor Events\nSubject: June 12 reservation\n\nOur design team has reserved your Lakeside Room for a product presentation on June 12. Attendance has increased from 40 to approximately 65 people. Could you confirm that the room can accommodate the larger group? We would also like to add a projector to our reservation.' },
      { label: 'Reply', text: 'From: Harbor Events\nTo: Elena Ruiz\n\nThe Lakeside Room holds no more than 50 guests. I have temporarily reserved the Garden Hall for you instead; it seats 80 and is available on June 12. The rental price is $120 higher, but audiovisual equipment—including a projector—is included. Please let me know by Thursday whether you would like to make the change.' },
    ],
    questions: [
      { question: 'Why did Ms. Ruiz contact Harbor Events?', choices: ['To cancel a presentation', 'To report a billing error', 'To ask about a larger attendance and equipment', 'To change the date of an event'], answer: 2, explanation: 'She asks whether the room can hold 65 people and requests a projector.' },
      { question: 'What is indicated about the Lakeside Room?', choices: ['It includes a projector.', 'It is unavailable on June 12.', 'It can seat 80 guests.', 'It is too small for the new attendance estimate.'], answer: 3, explanation: 'Its maximum capacity is 50, below the estimated 65 attendees.' },
      { question: 'What has Harbor Events done?', choices: ['Issued a new invoice', 'Temporarily held another room', 'Canceled the original booking', 'Moved the event to Thursday'], answer: 1, explanation: 'The reply says the Garden Hall has been temporarily reserved.' },
      { question: 'What is included in the Garden Hall rental?', choices: ['Catering service', 'Parking passes', 'Audiovisual equipment', 'Printed invitations'], answer: 2, explanation: 'Audiovisual equipment, including a projector, is included.' },
      { question: 'What must Ms. Ruiz do by Thursday?', choices: ['Provide a guest list', 'Pay an additional fee', 'Confirm whether she wants to change rooms', 'Send presentation materials'], answer: 2, explanation: 'The reply asks her to decide whether to switch to the Garden Hall.' },
    ],
  },
];
