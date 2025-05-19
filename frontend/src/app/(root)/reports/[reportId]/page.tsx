'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ReportDetailSummary } from '@/widgets/ReportDetailSummary/ReportDetailSummary';
import { getReportDetail } from '@/entities/report/model/api';

export default function ReportDetailPage() {
  const router = useRouter();
  const { reportId } = useParams();

  // 레포트 상세 조회
  const { data: report, isLoading } = useQuery({
    queryKey: ['reportDetail', reportId],
    queryFn: () => getReportDetail(reportId as string),
  });

  // 뒤로가기
  const handleBack = () => {
    router.push('/reports');
  };

  // 채팅 기록 보기
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

  return (
    <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
      <button onClick={handleBack} className="mb-2 text-gray-400 hover:text-gray-600">
        ← 뒤로
      </button>

      <h2 className="font-bold text-lg mb-4">상담 세션 상세</h2>

      <ReportDetailSummary report={report} onViewChat={handleViewChat} />
    </div>
  );
}
