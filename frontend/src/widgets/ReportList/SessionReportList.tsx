'use client';
import { SessionReport } from '@/entities/report/model/types';
import Link from 'next/link';

interface Props {
  reports: SessionReport[];
  isLoading: boolean;
}

export function SessionReportList({ reports, isLoading }: Props) {
  if (isLoading) return <div>불러오는 중...</div>;
  if (reports.length === 0) return <div>상담 내역이 없습니다.</div>;

  return (
    <ul className="space-y-4">
      {reports.map((r) => (
        <li
          key={r.sreportId}
          className="relative bg-[#fff7ed] rounded-xl p-4 transition-all duration-200 hover:bg-[#ffe3c1] hover:shadow-lg cursor-pointer"
        >
          {/* 좌측 연한 주황색 세로선 */}
          <div className="absolute left-0 top-0 h-full w-1 bg-[#ff9134] rounded-s-xl" />
          <Link href={`/reports/${r.sreportId}`} className="block pl-3">
            <div className="font-bold leading-relaxed mb-3">{r.sreportTitle}</div>
            <div className="text-xs text-gray-500">{new Date(r.createdAt + 'Z').toLocaleString('ko-KR')}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
