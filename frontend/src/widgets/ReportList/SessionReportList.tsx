'use client';
import { SessionReport } from '@/entities/report/model/types';
import Link from 'next/link';
import { useState } from 'react';

interface Props {
  reports: SessionReport[];
  isLoading: boolean;
  onUpdate?: (reportId: number, currentTitle: string) => void;
  onDelete?: (reportId: number) => void;
}

export function SessionReportList({ reports, isLoading, onUpdate, onDelete }: Props) {
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
        <p className="text-sm">상담 레포트가 없습니다.</p>
      </div>
    );
  return (
    <ul className="space-y-4">
      {reports.map((r) => (
        <li
          key={r.sreportId}
          className="relative bg-[#fff7ed] rounded-xl p-4 transition-all duration-200 hover:bg-[#ffe3c1] hover:shadow-lg cursor-pointer"
        >
          {/* 좌측 연한 주황색 세로선 */}
          <div className="absolute left-0 top-0 h-full w-1 bg-[#ff9134] rounded-s-xl" />
          {/* 본문 */}
          <Link href={`/reports/${r.sreportId}`} className="block pl-3">
            <div className="font-bold leading-relaxed mb-3">{r.sreportTitle}</div>
            <div className="text-xs text-gray-500">{new Date(r.createdAt + 'Z').toLocaleString('ko-KR')}</div>
          </Link>
          {/* 버튼 영역 */}
          <div className="absolute top-3 right-3 flex gap-2">
            {onUpdate && (
              <button
                onClick={() => onUpdate(r.sreportId, r.sreportTitle)}
                className="px-2 py-1 text-xs rounded-lg border border-orange-400 text-orange-600 hover:bg-orange-100 transition"
              >
                ✏ 수정
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(r.sreportId)}
                className="px-2 py-1 text-xs rounded-lg border border-red-400 text-red-600 hover:bg-red-100 transition"
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
