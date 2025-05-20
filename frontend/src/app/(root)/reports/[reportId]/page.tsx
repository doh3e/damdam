'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ReportDetailSummary } from '@/widgets/ReportDetailSummary/ReportDetailSummary';
import { getReportDetail } from '@/entities/report/model/api';
import type { Report } from '@/entities/report/model/types';
import { ReportDetail } from '@/entities/report/model/types';

export default function ReportDetailPage() {
  const router = useRouter();
  const { reportId } = useParams();

  const { data: report, isLoading } = useQuery<Report>({
    queryKey: ['reportDetail', reportId],
    queryFn: () => getReportDetail(reportId as string),
    enabled: !!reportId,
  });

  const handleBack = () => {
    router.push('/reports');
  };

  const handleViewChat = () => {
    router.push(`/reports/${reportId}/chat`);
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
        <div className="text-center py-12 text-gray-400">불러오는 중...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
        <div className="text-center py-12 text-red-400">레포트를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const mappedReport: ReportDetail = {
    id: report.sreportId.toString(),
    date: report.createdAt.split('T')[0],
    time: report.createdAt.split('T')[1].slice(0, 5),
    valence: parseFloat(report.valence),
    arousal: parseFloat(report.arousal),
    emotionTrend: [parseFloat(report.valence), parseFloat(report.arousal)],
    summary: report.summary,
    analyze: report.analyze,
    keywords: [], // ✅ 일단 더미값
    chat: [], // ✅ 일단 더미값
  };

  return (
    <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
      <button onClick={handleBack} className="mb-2 text-gray-400 hover:text-gray-600">
        ← 뒤로
      </button>

      <h2 className="font-bold text-lg mb-4">상담 세션 상세</h2>

      <ReportDetailSummary report={mappedReport} onViewChat={handleViewChat} />
    </div>
  );
}
