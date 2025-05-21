'use client';
import React from 'react';
import type { PeriodReport } from '@/entities/report/model/types';
import Link from 'next/link';

interface Props {
  reports: PeriodReport[];
  isLoading: boolean;
  onUpdate?: (id: number, title: string) => void;
  onDelete?: (id: number) => void;
}

export function PeriodReportList({ reports, isLoading, onUpdate, onDelete }: Props) {
  if (isLoading) return <div>불러오는 중...</div>;
  if (reports.length === 0)
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 mb-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2H5V5h14v10h-4v2m-6 0h6" />
        </svg>
        <p className="text-sm">기간별 레포트가 없습니다.</p>
      </div>
    );
  return (
    <ul className="space-y-4">
      {reports.map((r) => (
        <li key={r.preportId} className="relative bg-[#f5f5f5] rounded-xl p-4 shadow hover:shadow-md transition">
          <Link href={`/reports/periodic/${r.preportId}`} className="block">
            <div className="font-bold text-base mb-1">{r.preportTitle}</div>
            <div className="text-sm text-gray-600 mb-2">
              {r.startDate} ~ {r.endDate}
            </div>
            <div className="text-xs text-gray-400">생성일: {new Date(r.createdAt).toLocaleString('ko-KR')}</div>
          </Link>

          {/* 버튼 영역 */}
          <div className="absolute top-3 right-3 flex gap-2">
            {onUpdate && (
              <button
                onClick={() => onUpdate(r.preportId, r.preportTitle)}
                className="px-2 py-1 text-xs rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition"
              >
                ✏ 수정
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(r.preportId)}
                className="px-2 py-1 text-xs rounded-lg border border-red-500 text-red-600 hover:bg-red-50 transition"
              >
                🗑 삭제
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
