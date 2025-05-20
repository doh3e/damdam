'use client';
import { SessionReport } from '@/entities/report/model/types';

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
        <li key={r.sReportId} className="border p-2 rounded">
          <div className="font-bold">{r.sReportTitle}</div>
          <div className="text-sm text-gray-500">{new Date(r.createdAt + 'Z').toLocaleString('ko-KR')}</div>
        </li>
      ))}
    </ul>
  );
}
