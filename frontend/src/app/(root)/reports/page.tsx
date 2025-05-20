'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportCalendar } from '@/widgets/ReportCalendar/ReportCalendar';
import { getReports } from '@/entities/report/model/api';
import { SessionReportList } from '@/widgets/ReportList/SessionReportList';
import { PeriodReportList } from '@/widgets/ReportList/PeriodReportList';
import { format } from 'date-fns';
import type { SessionReport, PeriodReport } from '@/entities/report/model/types';

export default function ReportsPage() {
  const [category, setCategory] = useState<'상담별' | '기간별'>('상담별');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [keyword, setKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState('최신순');

  const formattedDate = selectedDate ? format(selectedDate, 'yyyyMMdd') : undefined;
  const apiCategory = category === '상담별' ? 'session' : 'period';

  const { data: reports = [], isLoading } = useQuery<SessionReport[] | PeriodReport[]>({
    queryKey: ['reports', category, formattedDate, keyword],
    queryFn: () =>
      getReports({
        category: apiCategory,
        start: formattedDate,
        end: formattedDate,
        keyword,
      }),
    enabled: true, // 두 카테고리 모두에서 작동
  });

  return (
    <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
      <h2 className="font-bold text-lg mb-4">나의 상담</h2>

      {/* 탭 */}
      <div className="grid grid-cols-2 mb-4 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 text-sm font-semibold">
        <button
          className={`px-3 py-1 rounded-lg font-semibold text-sm ${
            category === '상담별' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => {
            setCategory('상담별');
            setSelectedDate(null);
          }}
        >
          나의 과거 상담 내역
        </button>
        <button
          className={`px-3 py-1 rounded-lg font-semibold text-sm ${
            category === '기간별' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => setCategory('기간별')}
        >
          기간별 요약 레포트
        </button>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-2 mb-4">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="최신순">최신순</option>
          <option value="오래된순">오래된순</option>
          <option value="조회순">조회순</option>
        </select>
        <input
          className="border rounded px-2 py-1 text-sm flex-1"
          placeholder="키워드로 검색"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 날짜 선택 */}
      {category === '상담별' && (
        <>
          <span className="font-bold block mb-2">상담날짜 선택</span>
          <ReportCalendar selectedDate={selectedDate ?? new Date()} onSelectDate={setSelectedDate} />
          <button onClick={() => setSelectedDate(null)} className="mt-2 text-sm text-blue-600">
            전체 목록 보기
          </button>
        </>
      )}

      {/* 레포트 리스트 */}
      {category === '상담별' ? (
        <SessionReportList reports={reports as SessionReport[]} isLoading={isLoading} />
      ) : (
        <PeriodReportList reports={reports as PeriodReport[]} isLoading={isLoading} />
      )}
    </div>
  );
}
