'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getReportDetail } from '@/entities/report/model/api';

export default function ChatHistoryPage() {
  const router = useRouter();
  const { reportId } = useParams();

  // 레포트 상세(채팅 포함) 조회
  const { data: report, isLoading } = useQuery({
    queryKey: ['reportDetail', reportId],
    queryFn: () => getReportDetail(reportId as string),
  });

  // 뒤로가기
  const handleBack = () => {
    router.push(`/reports/${reportId}`);
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
        <div className="text-center py-12 text-red-400">채팅 기록을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
      <button onClick={handleBack} className="mb-2 text-gray-400 hover:text-gray-600">
        ← 뒤로
      </button>

      <h2 className="font-bold text-lg mb-4">전체 대화 기록</h2>

      <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-3 mb-4">
        {report.chat.map((msg, i) => (
          <div key={i} className={`flex mb-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] px-3 py-2 rounded-lg ${
                msg.from === 'user' ? 'bg-orange-500 text-white' : 'bg-white border text-gray-800'
              }`}
            >
              <div className="text-sm">{msg.text}</div>
              <div className="text-xs text-gray-400 mt-1 text-right">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
