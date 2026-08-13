import type { Metadata } from 'next';
import { LearningHub } from './learning-hub';

export const metadata: Metadata = {
  title: 'Executive English Lab — Vũ Đài TOEIC',
  description: 'Ngân hàng tiếng Anh C1–C2 cho software engineering và IT systems trong môi trường Bosch quốc tế, kèm bài tập ghi nhớ.',
};

export default function LearnPage() {
  return <LearningHub />;
}
