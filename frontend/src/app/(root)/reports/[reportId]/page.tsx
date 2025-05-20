'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getReportDetail } from '@/entities/report/model/api';
import type { ReportDetailResponse } from '@/entities/report/model/types';

export default function ReportDetailTestPage() {
  const { reportId } = useParams();

  const { data, isLoading, error } = useQuery<ReportDetailResponse>({
    queryKey: ['reportDetail', reportId],
    queryFn: () => getReportDetail(String(reportId)),
    enabled: !!reportId,
  });

  if (isLoading) return <div className="p-4">🔄 로딩 중...</div>;
  if (error) return <div className="p-4 text-red-500">❌ 에러 발생: {(error as Error).message}</div>;
  if (!data) return <div className="p-4 text-red-500">❌ 데이터를 불러오지 못했습니다.</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-lg font-bold mb-4">📄 레포트 Raw 응답 데이터</h1>
      <pre className="bg-gray-100 text-sm p-4 rounded overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
