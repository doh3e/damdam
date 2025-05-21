'use client';
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/axiosInstance';

type Notice = {
  noticeId: number;
  noticeCategory: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const fetchNotices = async (): Promise<Notice[]> => {
  return apiClient.get<Notice[]>('/helps/notice');
};

export default function NoticeListPage() {
  const {
    data: notices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notices'],
    queryFn: fetchNotices,
  });

  return (
    <div className="p-4 space-y-6 flex flex-col items-center">
      {/* 공지사항 목록 */}
      <section className="bg-white w-full max-w-xl mx-auto rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-5">
          <button onClick={() => (window.location.href = '/mypage')} className="text-lg">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          공지사항
        </h2>
        {/* 메뉴 리스트 */}
        <div className="w-full bg-white rounded-2xl shadow border border-gray-100 mb-8">
          <ul>
            {notices && notices.length > 0
              ? notices.map((notice) => (
                  <li key={notice.noticeId} className="border-b last:border-b-0">
                    <Link
                      href={`/helps/notice/${notice.noticeId}`}
                      className="flex items-center px-4 py-5 hover:bg-orange-50 transition"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{notice.title}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="text-gray-300 group-hover:text-orange-400 ml-2">&gt;</span>
                    </Link>
                  </li>
                ))
              : !isLoading && <li className="text-center py-8 text-gray-400">등록된 공지사항이 없습니다!</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
