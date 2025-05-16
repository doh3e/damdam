'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from '@/shared/ui/calendar';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axiosInstance from '@/shared/api/axiosInstance';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ConsultingReportPage() {
  const [step, setStep] = useState<'list' | 'detail' | 'chat'>('list');
  const [category, setCategory] = useState<'상담별' | '기간별'>('상담별');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [reportDates, setReportDates] = useState<Date[]>([]);
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  // 레포트 존재 날짜 조회
  const { data: allReportDates } = useQuery({
    queryKey: ['reportDates'],
    queryFn: async () => {
      const res = await axiosInstance.get('/reports/dates');
      return res.data.map((dateStr: string) => new Date(dateStr));
    },
  });

  // 레포트 있는 날짜 업데이트
  useEffect(() => {
    if (allReportDates) {
      setReportDates(allReportDates);
    }
  }, [allReportDates]);

  // 변경: selectedDate가 바뀔 때마다 레포트 조회
  const { data: reportList = [] } = useQuery({
    queryKey: ['reports', category, formattedDate],
    enabled: category === '상담별',
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/reports?category=${category}&start=${formattedDate}&end=${formattedDate}&keyword=&page=1`
      );
      return res.data;
    },
  });

  const { data: selectedSession } = useQuery({
    queryKey: ['reportDetail', selectedSessionId],
    enabled: !!selectedSessionId,
    queryFn: async () => {
      const res = await axiosInstance.get(`/reports/${selectedSessionId}`);
      return res.data;
    },
  });

  return (
    <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
      {step === 'list' && (
        <>
          <h2 className="font-bold text-lg mb-4">나의 상담</h2>

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
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date: Date | undefined) => {
                    if (date) setSelectedDate(date); // 날짜 선택 시 상태 업데이트
                  }}
                  modifiers={{ hasReport: reportDates }} // 레포트 날짜 하이라이트
                  modifiersStyles={{
                    backgroundColor: '#FECACA',
                    color: '#DC2626',
                    borderRadius: '50%',
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mb-2">{formattedDate.replace(/-/g, '.')}</div>
              {reportList.length > 0 ? (
                reportList.map((report: any) => (
                  <div
                    key={report.id}
                    className="bg-orange-50 border-l-4 border-orange-400 rounded p-3 mb-2 cursor-pointer"
                    onClick={() => {
                      setSelectedSessionId(report.id);
                      setStep('detail');
                    }}
                  >
                    <div className="flex gap-2 mb-1">
                      {report.keywords.map((k: string) => (
                        <span key={k} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                          {k}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-800">{report.summary}</div>
                    <div className="text-xs text-gray-400 mt-1">{report.time}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">상담 내역이 없습니다.</div>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-center text-sm mt-10">기간</div>
          )}
        </>
      )}

      {step === 'detail' && selectedSession && (
        <div className="p-4">
          <h2 className="font-bold text-lg mb-2">상담 세션 상세</h2>
          <div className="flex gap-2 mb-2">
            {selectedSession.keywords.map((k: string) => (
              <span key={k} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                {k}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {selectedSession.date.replace(/-/g, '.')} {selectedSession.time}
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">주요 문제 상황</div>
            <div className="text-sm text-gray-800">{selectedSession.summary}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">감정 요약</div>
            <div className="text-sm text-gray-800">{selectedSession.emotionSummary}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">감정 점수 추이</div>
            <div className="h-48 bg-white rounded border">
              <Line
                data={{
                  labels: Array.from({ length: selectedSession.emotionTrend.length }, (_, i) => `세션${i + 1}`),
                  datasets: [
                    {
                      label: '감정 점수',
                      data: selectedSession.emotionTrend,
                      borderColor: '#F87171',
                      backgroundColor: 'rgba(248,113,113,0.1)',
                      tension: 0.4,
                      pointBackgroundColor: '#F87171',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 100 } },
                }}
              />
            </div>
          </div>
          <button
            className="w-full mt-4 py-3 bg-orange-500 text-white font-semibold rounded"
            onClick={() => setStep('chat')}
          >
            전체 대화 기록 확인하기
          </button>
        </div>
      )}

      {step === 'chat' && selectedSession && (
        <div className="p-4 flex flex-col h-[calc(100vh-56px)]">
          <h2 className="font-bold text-lg mb-2">전체 대화 기록</h2>
          <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-3 mb-4">
            {selectedSession.chat.map((msg: any, i: number) => (
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
      )}
    </div>
  );
}
