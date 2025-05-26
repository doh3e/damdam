'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPeriodicReportDetail } from '@/entities/report/model/api';
import type { PeriodReportDetail } from '@/entities/report/model/types';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function PeriodReportDetailPage() {
  const { preportId } = useParams();
  const router = useRouter();

  const {
    data: report,
    isLoading,
    error,
  } = useQuery<PeriodReportDetail>({
    queryKey: ['periodReportDetail', preportId],
    queryFn: () => getPeriodicReportDetail(Number(preportId)),
    enabled: !!preportId,
  });

  if (isLoading) return <div className="p-4">로딩 중...</div>;
  if (!report) return <div className="p-4 text-red-500">레포트를 불러오지 못했습니다.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow space-y-6">
      <div>
        <div className="text-xl font-bold flex items-center gap-5">
          <button onClick={() => router.back()} className="text-lg">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2 className="text-xl font-bold">기간별 요약 레포트</h2>
        </div>
        <div className="inline-block bg-orange-50 text-orange-600 font-bold text-xl py-1 mt-3 rounded-md shadow">
          {report.preportTitle}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          기간 : {report.startDate} ~ {report.endDate}
        </p>
      </div>

      <section>
        <h3 className="font-bold text-md text-orange-800 mb-1">고민 요약</h3>
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{report.worry}</p>
      </section>

      <section>
        <h3 className="font-bold text-md text-orange-800 mb-1">조언</h3>
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{report.advice}</p>
      </section>

      <section>
        <h3 className="font-bold text-md text-orange-800 mb-1">칭찬</h3>
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{report.compliment}</p>
      </section>

      <section>
        <h3 className="font-bold text-md text-orange-800 mb-1">상담 리스트</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {report.counselings.map((c) => (
            <li key={c.counsId}>
              {c.counsTitle} ({new Date(c.createdAt).toLocaleDateString('ko-KR')})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
