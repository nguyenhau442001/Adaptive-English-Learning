'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SeedContentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function seed() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage(`Đã nạp ${data.wordCount} từ vựng và ${data.questionCount} câu hỏi.`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể nạp nội dung');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-7 mb-0 rounded border border-dashed border-neutral-600 bg-black/10 p-4 text-sm">
      <p className="mb-3 text-neutral-400">
        Bộ dữ liệu TOEIC chưa được kích hoạt. Nạp gói khởi đầu gồm 314 từ vựng và các
        thử thách mẫu chỉ với một lần nhấn.
      </p>
      <button
        onClick={seed}
        disabled={loading}
        className="rounded bg-orange-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-50"
      >
        {loading ? 'Đang mở cổng đấu...' : 'Kích hoạt đấu trường'}
      </button>
      {message && <p className="mt-3 text-neutral-400">{message}</p>}
    </div>
  );
}
