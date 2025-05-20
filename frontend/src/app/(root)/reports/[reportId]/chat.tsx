// 'use client';
// import React from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useQuery } from '@tanstack/react-query';
// import { getReportDetail } from '@/entities/report/model/api';
// import type { Report, ReportDetail, ChatMessage } from '@/entities/report/model/types';

// export default function ChatHistoryPage() {
//   const router = useRouter();
//   const { reportId } = useParams();

//   // 1. 레포트 원본 타입으로 조회 (Report)
//   const { data: report, isLoading } = useQuery<Report>({
//     queryKey: ['reportDetail', reportId],
//     queryFn: () => getReportDetail(reportId as string),
//     enabled: !!reportId,
//   });

//   const handleBack = () => {
//     router.push(`/reports/${reportId}`);
//   };

//   if (isLoading) {
//     return (
//       <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
//         <div className="text-center py-12 text-gray-400">불러오는 중...</div>
//       </div>
//     );
//   }

//   if (!report) {
//     return (
//       <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
//         <div className="text-center py-12 text-red-400">채팅 기록을 찾을 수 없습니다.</div>
//       </div>
//     );
//   }

//   // 2. Report → ReportDetail로 매핑
//   const mappedReport: ReportDetail = {
//     id: report.sreportId.toString(),
//     date: report.createdAt.split('T')[0],
//     time: report.createdAt.split('T')[1].slice(0, 5),
//     valence: parseFloat(report.valence),
//     arousal: parseFloat(report.arousal),
//     emotionTrend: [parseFloat(report.valence), parseFloat(report.arousal)],
//     summary: report.summary,
//     analyze: report.analyze,
//     keywords: [], // ❗ 실제 응답에 없다면 일단 빈 배열
//     chat: [], // ❗ 실제 응답에 없다면 일단 빈 배열
//   };

//   return (
//     <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
//       <button onClick={handleBack} className="mb-2 text-gray-400 hover:text-gray-600">
//         ← 뒤로
//       </button>

//       <h2 className="font-bold text-lg mb-4">전체 대화 기록</h2>

//       <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-3 mb-4">
//         {mappedReport.chat.map((msg: ChatMessage, i: number) => (
//           <div key={i} className={`flex mb-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
//             <div
//               className={`max-w-[70%] px-3 py-2 rounded-lg ${
//                 msg.from === 'user' ? 'bg-orange-500 text-white' : 'bg-white border text-gray-800'
//               }`}
//             >
//               <div className="text-sm">{msg.text}</div>
//               <div className="text-xs text-gray-400 mt-1 text-right">{msg.time}</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
