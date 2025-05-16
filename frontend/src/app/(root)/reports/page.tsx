'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportCalendar } from '@/widgets/ReportCalendar/ReportCalendar';
import { ReportList } from '@/widgets/ReportList/ReportList';
import { getReportsByDate, getAllReports } from '@/entities/report/model/api';
import { format } from 'date-fns';

export default function ReportsPage() {
  const [category, setCategory] = useState<'상담별' | '기간별'>('상담별');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  // 전체 레포트 조회
  const { data: allReports = [], isLoading: allLoading } = useQuery({
    queryKey: ['reports', '전체'],
    queryFn: () => getAllReports(),
    enabled: category === '상담별' && !selectedDate,
  });

  // 날짜별 레포트 조회
  const { data: dateReports = [], isLoading: dateLoading } = useQuery({
    queryKey: ['reports', 'SESSION', formattedDate],
    queryFn: () => getReportsByDate(formattedDate),
    enabled: category === '상담별' && !!selectedDate,
  });

  const reportsToShow = selectedDate ? dateReports : allReports;
  const isLoading = selectedDate ? dateLoading : allLoading;

  return (
    <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
      <h2 className="font-bold text-lg mb-4">나의 상담</h2>

      {/* 탭 */}
      <div className="grid grid-cols-2 mb-4 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 text-sm font-semibold">
        <button
          className={`px-3 py-1 rounded-lg font-semibold text-sm ${
            category === '상담별' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => setCategory('상담별')}
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

      {category === '상담별' ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <select className="border rounded px-2 py-1 text-sm">
              <option>최신순</option>
              <option>오래된순</option>
              <option>조회순</option>
            </select>
            <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="키워드로 검색" type="text" />
          </div>

          <span>상담날짜 선택</span>
          {/* 캘린더 */}
          <ReportCalendar selectedDate={selectedDate ?? new Date()} onSelectDate={setSelectedDate} />
          <button onClick={() => setSelectedDate(null)}>전체 보기</button>

          <div className="text-xs text-gray-500 mb-2">
            {selectedDate ? formattedDate.replace(/-/g, '.') : '전체 레포트 보기'}
          </div>

          <ReportList reports={reportsToShow} isLoading={isLoading} />
        </>
      ) : (
        <div className="text-gray-500 text-center text-sm mt-10">기간별 요약 레포트 기능은 준비중입니다.</div>
      )}
    </div>
  );
}
