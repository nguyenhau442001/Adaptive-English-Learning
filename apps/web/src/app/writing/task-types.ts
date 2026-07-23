// 3 ETS TOEIC Writing task types per the product brief.
export const WRITING_TASKS = [
  {
    type: 'picture_description',
    label: 'Picture description',
    prompt:
      'Imagine a photo showing a delivery worker handing a package to a customer at a front door, with a delivery van parked on the street. Write ONE sentence describing the picture, using the two given words: "package" and "deliver".',
    minWords: 1,
  },
  {
    type: 'email_response',
    label: 'Respond to a written request',
    prompt:
      'Read this email and write a response:\n\n"Hi, I noticed the invoice for order #7734 lists the wrong billing address. Could you correct this and resend the invoice by Friday? Also, could you confirm whether the shipment has left the warehouse yet? Thanks, Maria."\n\nWrite an email response of at least 3 sentences addressing both of Maria\'s requests.',
    minWords: 30,
  },
  {
    type: 'opinion_essay',
    label: 'Express an opinion',
    prompt:
      'Some companies require employees to work from the office at least three days a week, while others allow fully remote work. Which policy do you think is more effective for productivity, and why? Give reasons and examples to support your opinion. Write at least 300 words.',
    minWords: 300,
  },
] as const;

export type WritingTaskType = (typeof WRITING_TASKS)[number]['type'];
