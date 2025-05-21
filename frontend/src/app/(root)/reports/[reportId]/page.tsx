'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getReportDetail } from '@/entities/report/model/api';
import type { ReportDetailResponse } from '@/entities/report/model/types';
import EmotionCircle from '@/entities/report/ui/EmotionCircle';
import EmotionLineChart from '@/entities/report/ui/EmotionLineChart';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Modal from '@/shared/ui/modal';

export default function ReportDetailPage() {
  const { reportId } = useParams();
  const [focusEmotion, setFocusEmotion] = useState<keyof ReportDetailResponse['emotionList'][0]['emotion'] | undefined>(
    undefined
  );
  const router = useRouter();
  const [showInfoModal, setShowModal] = useState(false);
  const handleGoToCounsel = () => {
    if (report?.counsId) {
      router.push(`/counseling/${report.counsId}`);
    }
  };

  const {
    data: report,
    isLoading,
    error,
  } = useQuery<ReportDetailResponse>({
    queryKey: ['reportDetail', reportId],
    queryFn: () => getReportDetail(String(reportId)),
    enabled: !!reportId,
  });

  if (isLoading) return <div className="p-4">로딩 중...</div>;
  if (!report) return <div className="p-4 text-red-500">레포트를 불러오지 못했습니다.</div>;

  const dateObj = new Date(report.createdAt + 'Z');
  const formattedDate = dateObj.toLocaleDateString('ko-KR');
  const formattedTime = dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow space-y-6">
      <div>
        <div className='className="text-xl font-bold flex items-center gap-5'>
          <button onClick={() => router.back()} className="text-lg">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2 className="text-xl font-bold">상담 세션 상세</h2>
        </div>
        <div className="inline-block bg-orange-50 text-orange-600 font-bold text-xl py-1 mt-3 rounded-md shadow">
          {report.sreportTitle}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {formattedDate} {formattedTime}
        </p>
      </div>

      <section>
        <h3 className="font-bold text-md text-orange-800 mb-1">주요 문제 상황</h3>
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{report.summary}</p>
      </section>

      <section>
        <h3 className="font-bold text-md text-orange-800 mb-1">감정 요약</h3>
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{report.analyze}</p>
      </section>

      <section>
        <div className="flex items-center gap-1 mb-1">
          <h3 className="font-bold text-md text-orange-800">Russell 감정 모형</h3>
          <button
            onClick={() => setShowModal(true)}
            title="러셀 감정 모델 설명 보기"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ℹ️
          </button>
        </div>
        <EmotionCircle valence={report.valence} arousal={report.arousal} />
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-md text-orange-800">감정 추이</h3>
          <select
            value={focusEmotion ?? ''}
            onChange={(e) => setFocusEmotion(e.target.value === '' ? undefined : (e.target.value as any))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">전체 감정 보기</option>
            <option value="happiness">기쁨</option>
            <option value="sadness">슬픔</option>
            <option value="angry">분노</option>
            <option value="neutral">중립</option>
            <option value="other">기타</option>
          </select>
        </div>

        <EmotionLineChart emotionList={report.emotionList} focusEmotion={focusEmotion} />
      </section>
      <div className="text-center">
        <button
          onClick={handleGoToCounsel}
          className="bg-orange-500 text-white mt-5 px-4 py-2 rounded font-semibold hover:bg-orange-600"
        >
          전체 대화 기록 확인하기
        </button>
      </div>
      {showInfoModal && (
        <Modal
          message="Russell 감정 원형 모델이란?"
          submessage={`
    Russell 감정 원형 모델은 감정을 <strong>두 축</strong>으로 나눠 <br />원 안에 배치한 심리학 이론입니다.<br/><br/>
    📍 <strong>세로축 ↑↓ (각성도)</strong><br/>
    위쪽은 에너지가 높은 상태 (활력, 긴장),<br/>
    아래쪽은 차분하거나 졸린 상태입니다.<br/><br/>
    📍 <strong>가로축 →← (유쾌도)</strong><br/>
    오른쪽은 기쁨·만족 같은 긍정 감정,<br/>
    왼쪽은 슬픔·분노 같은 부정 감정을 나타냅니다.<br/><br/>
    🟠 그래프 안의 점은 사용자의 감정 상태를 <br /><strong>시각적으로 표시</strong>합니다.
  `}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
