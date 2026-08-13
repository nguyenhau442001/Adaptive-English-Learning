'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getWeaknessLogs, type LocalWeaknessLog } from '@/lib/local-learning-store';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface ErrorTypeAggregate {
  errorType: string;
  skills: Set<string>;
  count7d: number;
  count30d: number;
  latestNote: string | null;
}

export default function WeaknessMapPage() {
  const [snapshot, setSnapshot] = useState<{ logs: LocalWeaknessLog[]; now: number } | null>(null);

  useEffect(() => {
    queueMicrotask(() => setSnapshot({ logs: getWeaknessLogs(), now: Date.now() }));
  }, []);

  const aggregates = useMemo(() => {
    if (!snapshot) return [];
    const byErrorType = new Map<string, ErrorTypeAggregate>();
    for (const row of snapshot.logs) {
      const age = snapshot.now - new Date(row.createdAt).getTime();
      if (age > THIRTY_DAYS_MS) continue;
      const existing = byErrorType.get(row.errorType) ?? {
        errorType: row.errorType,
        skills: new Set<string>(),
        count7d: 0,
        count30d: 0,
        latestNote: null,
      };
      existing.skills.add(row.skill);
      existing.count30d += 1;
      if (age <= SEVEN_DAYS_MS) existing.count7d += 1;
      if (existing.latestNote === null && row.note) existing.latestNote = row.note;
      byErrorType.set(row.errorType, existing);
    }
    return Array.from(byErrorType.values()).sort(
      (a, b) => b.count30d - a.count30d || b.count7d - a.count7d,
    );
  }, [snapshot]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Weakness Map</h1>
        <Link href="/" className="text-sm text-blue-600 underline">Dashboard</Link>
      </div>

      <p className="mb-6 text-sm text-neutral-600">
        Mỗi câu sai được phân loại theo đúng loại bẫy và lưu riêng trong trình duyệt. Không có dữ
        liệu nào được gửi tới dịch vụ bên ngoài.
      </p>

      {snapshot === null ? (
        <p className="text-neutral-600">Đang đọc dữ liệu cục bộ…</p>
      ) : aggregates.length === 0 ? (
        <p className="text-neutral-600">
          Chưa có lỗi được chẩn đoán trong 30 ngày qua. Các câu trả lời sai trong phần Listening,
          Reading và mock test sẽ tự xuất hiện ở đây.
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-neutral-200 bg-neutral-50"><th className="px-3 py-2 font-medium">Error type</th><th className="px-3 py-2 font-medium">Skill(s)</th><th className="px-3 py-2 text-right font-medium">7d</th><th className="px-3 py-2 text-right font-medium">30d</th></tr></thead>
            <tbody>
              {aggregates.map((aggregate) => (
                <tr key={aggregate.errorType} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3 py-2"><p className="font-medium">{formatErrorType(aggregate.errorType)}</p>{aggregate.latestNote && <p className="mt-1 text-xs text-neutral-500">{aggregate.latestNote}</p>}</td>
                  <td className="px-3 py-2 text-neutral-600">{Array.from(aggregate.skills).join(', ')}</td>
                  <td className={`px-3 py-2 text-right ${aggregate.count7d >= 2 ? 'font-semibold text-red-700' : ''}`}>{aggregate.count7d}</td>
                  <td className="px-3 py-2 text-right">{aggregate.count30d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatErrorType(errorType: string) {
  return errorType.split('_').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');
}
