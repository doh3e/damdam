'use client';
import React from 'react';
import { ReportDetail } from '@/entities/report/model/types';
import { EmotionCircle } from '@/entities/report/ui/EmotionCircle';
import { EmotionLineChart } from '@/entities/report/ui/EmotionLineChart';

interface ReportDetailSummaryProps {
  report: ReportDetail;
  onViewChat: () => void;
}

export function ReportDetailSummary({ report, onViewChat }: ReportDetailSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        {report.keywords.map((keyword) => (
          <span key={keyword} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
            {keyword}
          </span>
        ))}
      </div>

      <div className="text-xs text-gray-500 mb-2">
        {report.date} {report.time}
      </div>

      {/* 주요 상담 요약 */}
      <div className="mb-4">
        <div className="font-semibold mb-1">주요 상담 요약</div>
        <div className="text-sm text-gray-800">{report.summary}</div>
      </div>

      {/* 감정 요약 */}
      <div className="mb-4">
        <div className="font-semibold mb-1">감정 요약</div>
        <div className="text-sm text-gray-800">{report.analyze}</div>
      </div>

      {/* 감정 원형 그래프 */}
      <EmotionCircle valence={report.valence} arousal={report.arousal} />

      {/* 감정 변화 추이 선형 그래프 */}
      <div className="mb-4">
        <div className="font-semibold mb-1">상담 시간별 감정 점수 추이</div>
        <EmotionLineChart data={report.emotionTrend} />
      </div>

      {/* 전체 대화 기록 버튼 */}
      <button onClick={onViewChat} className="w-full mt-4 py-3 bg-orange-500 text-white font-semibold rounded">
        전체 대화 기록 확인하기
      </button>
    </div>
  );
}
