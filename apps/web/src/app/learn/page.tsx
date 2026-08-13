import type { Metadata } from 'next';
import { LearningHub } from './learning-hub';

export const metadata: Metadata = {
  title: 'Executive English Lab — Vũ Đài TOEIC',
  description: 'Ngân hàng bài học tiếng Anh nâng cao cho môi trường làm việc quốc tế, kèm bài tập ghi nhớ và giải thích.',
};

export default function LearnPage() {
  return <LearningHub />;
}
