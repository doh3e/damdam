'use client';
import { PeriodReport } from '@/entities/report/model/types';

interface Props {
  reports: PeriodReport[];
  isLoading: boolean;
}

export function PeriodReportList({ reports, isLoading }: Props) {
  if (isLoading) return <div>불러오는 중...</div>;
  if (reports.length === 0) return <div>기간별 레포트가 없습니다.</div>;

  return (
    <ul className="space-y-4">
      {reports.map((r) => (
        <li key={r.preportId} className="border p-2 rounded">
          <div className="font-bold">{r.preportTitle}</div>
          <div className="text-sm text-gray-500">
            {r.startDate} ~ {r.endDate}
          </div>
          <div className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
        </li>
      ))}
    </ul>
  );
}
