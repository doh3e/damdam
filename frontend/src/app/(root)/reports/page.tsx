'use client';

import React, { useState } from 'react';
import { Calendar } from '@/shared/ui/calendar'; // shadcn-ui calendar 설치 필요
import { Line } from 'react-chartjs-2';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 더미 데이터
const dummySessions = [
  {
    id: '1',
    date: '2025-04-22',
    time: '11:30',
    keywords: ['업무', '스트레스', '불안'],
    summary: '업무 스트레스로 인한 불안감과 수면 장애에 대해 상담함. 직장에서 업무 부담이 주요 원인으로 확인됨.',
    emotionSummary: '대화 초반에는 불안, 중반 이후에는 안정되는 경향을 보임.',
    emotionTrend: [48, 45, 40, 35, 55, 60, 50, 45, 60, 70],
    chat: [
      { from: 'bot', text: '안녕하세요! 어떤 고민이 있으신가요?', time: '오전 11:30' },
      { from: 'user', text: '요즘 회사에서 스트레스를 많이 받아요.', time: '오전 11:31' },
      { from: 'bot', text: '회사에서 스트레스를 받고 계시는군요. 어떤 부분이 가장 힘드신가요?', time: '오전 11:31' },
      { from: 'user', text: '업무량이 갑자기 늘었는데 상사의 기대치가 너무 높아서 부담돼요.', time: '오전 11:32' },
      {
        from: 'bot',
        text: '업무량 증가와 높은 기대에 부담을 느끼고 계시는군요. 그런 상황에서 어떤 감정을 주로 느끼시나요?',
        time: '오전 11:32',
      },
      { from: 'user', text: '불안하고 가슴이 답답해요. 힘들 땐 잠도 잘 안 와요.', time: '오전 11:33' },
      {
        from: 'bot',
        text: '불안감과 수면 문제를 겪고 계시는군요. 힘든 시기에 스스로를 돌볼 수 있는 방법을 함께 찾아볼까요?',
        time: '오전 11:33',
      },
    ],
  },
  // 추가 세션 더미 데이터 필요시 여기에 추가
];

const dummyCalendar = ['2025-04-11', '2025-04-16', '2025-04-22', '2025-04-23'];

export default function DummyConsultingReport() {
  // 단계: 'list' | 'detail' | 'chat'
  const [step, setStep] = useState<'list' | 'detail' | 'chat'>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-04-22'));
  const [selectedSession, setSelectedSession] = useState(dummySessions[0]);

  // 달력 날짜 표시용
  const isConsultDate = (date: Date) => dummyCalendar.includes(date.toISOString().slice(0, 10));

  // 차트 데이터
  const lineData = {
    labels: Array.from({ length: 10 }, (_, i) => `세션${i + 1}`),
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
  };

  return (
    <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-0">
      {/* 1. 나의 상담 내역 (목록/달력) */}
      {step === 'list' && (
        <div className="p-4">
          <h2 className="font-bold text-lg mb-4">나의 상담</h2>
          {/* 상단 카테고리/검색 */}
          <div className="flex gap-2 mb-2">
            <button className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 font-semibold text-sm">
              나의 과거 상담 내역
            </button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold text-sm">
              기간별 요약 레포트
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <select className="border rounded px-2 py-1 text-sm">
              <option>최신순</option>
              <option>오래된순</option>
              <option>조회순</option>
            </select>
            <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="키워드로 검색" type="text" />
          </div>
          {/* 달력 */}
          <div className="mb-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded border"
              modifiers={{
                consult: dummyCalendar.map((d) => new Date(d)),
              }}
              modifiersStyles={{
                consult: {
                  backgroundColor: '#FECACA',
                  color: '#DC2626',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                },
              }}
            />
          </div>
          {/* 해당 날짜 상담 내역 */}
          <div>
            <div className="text-xs text-gray-500 mb-2">
              {selectedDate.toISOString().slice(0, 10).replace(/-/g, '.')}
            </div>
            {/* 더미: 선택 날짜에 상담 내역이 있으면 표시 */}
            {dummySessions
              .filter((s) => s.date === selectedDate.toISOString().slice(0, 10))
              .map((s) => (
                <div
                  key={s.id}
                  className="bg-orange-50 border-l-4 border-orange-400 rounded p-3 mb-2 cursor-pointer"
                  onClick={() => {
                    setSelectedSession(s);
                    setStep('detail');
                  }}
                >
                  <div className="flex gap-2 mb-1">
                    {s.keywords.map((k) => (
                      <span key={k} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                        {k}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-800">{s.summary}</div>
                  <div className="text-xs text-gray-400 mt-1">{s.time}</div>
                </div>
              ))}
            {/* 없으면 안내 */}
            {dummySessions.filter((s) => s.date === selectedDate.toISOString().slice(0, 10)).length === 0 && (
              <div className="text-sm text-gray-400">상담 내역이 없습니다.</div>
            )}
          </div>
        </div>
      )}

      {/* 2. 상담 세션 상세 */}
      {step === 'detail' && (
        <div className="p-4">
          <h2 className="font-bold text-lg mb-2">상담 세션 상세</h2>
          <div className="flex gap-2 mb-2">
            {selectedSession.keywords.map((k) => (
              <span key={k} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                {k}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {selectedSession.date.replace(/-/g, '.')} {selectedSession.time}
          </div>
          {/* 상담 요약 */}
          <div className="mb-4">
            <div className="font-semibold mb-1">주요 문제 상황</div>
            <div className="text-sm text-gray-800">{selectedSession.summary}</div>
          </div>
          {/* 감정 요약 */}
          <div className="mb-4">
            <div className="font-semibold mb-1">감정 요약</div>
            <div className="text-sm text-gray-800">{selectedSession.emotionSummary}</div>
          </div>
          {/* 감정 변화 그래프 */}
          <div className="mb-4">
            <div className="font-semibold mb-1">사용자 입력 시점별 감정 점수 추이</div>
            <div className="h-48 bg-white rounded border">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true, max: 100 },
                  },
                }}
              />
            </div>
          </div>
          {/* 전체 대화 기록 버튼 */}
          <button
            className="w-full mt-4 py-3 bg-orange-500 text-white font-semibold rounded"
            onClick={() => setStep('chat')}
          >
            전체 대화 기록 확인하기
          </button>
        </div>
      )}

      {/* 3. 전체 대화 기록 */}
      {step === 'chat' && (
        <div className="p-4 flex flex-col h-[calc(100vh-56px)]">
          <h2 className="font-bold text-lg mb-2">전체 대화 기록</h2>
          <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-3 mb-4">
            {selectedSession.chat.map((msg, i) => (
              <div key={i} className={`flex mb-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg ${msg.from === 'user' ? 'bg-orange-500 text-white' : 'bg-white border text-gray-800'}`}
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
