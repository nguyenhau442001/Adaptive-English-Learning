export type ToeicQuestion = {
  focus: string;
  difficulty: string;
  prompt: string;
  options: string[];
  answer: number;
  translation: string;
  explanation: string;
  rule: string;
  trap: string;
  choiceNotes: string[];
};

declare const questionBank: ToeicQuestion[][];
export default questionBank;
