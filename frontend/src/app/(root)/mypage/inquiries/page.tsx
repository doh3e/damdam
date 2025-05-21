'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/shared/api/axiosInstance';
import { Button } from '@/shared/ui/button';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

type Inquiry = {
  inquiryId: number;
  title: string;
  content: string;
  answer?: {
    content: string;
    createdAt: string;
  } | null;
  isAnswered: boolean;
  createdAt: string;
};

const fetchInquiries = async (): Promise<Inquiry[]> => {
  const res = await axiosInstance.get('/helps/inquiry');
  return res.data ?? res; // API 구조에 따라 조정
};

const fetchInquiryDetail = async (inquiryId: number): Promise<Inquiry> => {
  const res = await axiosInstance.get(`/helps/inquiry/${inquiryId}`);
  return res.data ?? res;
};

const postInquiry = async (data: { title: string; content: string }) => {
  await axiosInstance.post('/helps/inquiry', data);
};

export default function InquiryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 상태: 선택된 문의, 모달 오픈 여부
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 문의 목록 조회
  const {
    data: inquiries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inquiries'],
    queryFn: fetchInquiries,
  });

  // 개별 문의 상세 조회
  const { data: inquiryDetail } = useQuery({
    queryKey: ['inquiry', selectedInquiryId],
    queryFn: () => fetchInquiryDetail(selectedInquiryId!),
    enabled: selectedInquiryId !== null,
  });

  // 문의 작성 뮤테이션
  const mutation = useMutation({
    mutationFn: postInquiry,
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });

  // 문의 작성 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('제목을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      setFormError('내용을 입력해 주세요.');
      return;
    }
    mutation.mutate({ title, content });
    setTitle('');
    setContent('');
    setFormError('');
  };

  return (
    <div className="p-4 spac-y-6 flex flex-col items-center">
      {/* 문의 목록 */}
      {!selectedInquiryId && (
        <section className="bg-white w-full max-w-xl mx-auto rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold mb-8 flex items-center justify-between">
            <span className="flex items-center gap-5">
              <button onClick={() => router.back()} className="text-lg">
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              문의하기
            </span>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-orange-500 border-orange-300"
              onClick={() => setShowModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} />새 문의
            </Button>
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {isLoading && <div className="py-12 text-center text-gray-400">불러오는 중...</div>}
            {error && <div className="py-12 text-center text-red-400">문의 목록을 불러오지 못했습니다.</div>}
            <ul>
              {inquiries && inquiries.length > 0
                ? inquiries.map((inq) => (
                    <li key={inq.inquiryId} className="border-b last:border-b-0">
                      <button
                        className="w-full flex items-center px-4 py-5 hover:bg-orange-50 transition"
                        onClick={() => setSelectedInquiryId(inq.inquiryId)}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{inq.title}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                            inq.isAnswered ? 'bg-gray-200 text-gray-500' : 'bg-orange-500 text-white'
                          }`}
                        >
                          {inq.isAnswered ? '답변완료' : '대기'}
                        </span>
                        <span className="text-gray-300 ml-2">&gt;</span>
                      </button>
                    </li>
                  ))
                : !isLoading && <li className="text-center py-8 text-gray-400">등록된 문의가 없습니다.</li>}
            </ul>
          </div>
        </section>
      )}

      {/* 문의 상세 */}
      {selectedInquiryId && inquiryDetail && (
        <main className="w-full max-w-md mx-auto flex-1 px-4 pb-4">
          <h2 className="text-xl font-bold mt-6 mb-4">문의 상세</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="font-bold text-base mb-2">{inquiryDetail.title}</div>
            <div className="text-xs text-gray-400 mb-4">{new Date(inquiryDetail.createdAt).toLocaleDateString()}</div>
            <div className="text-base text-gray-800 whitespace-pre-line mb-6">{inquiryDetail.content}</div>
            {inquiryDetail.answer ? (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded mb-2">
                <div className="text-xs text-gray-500 mb-2">
                  담담이 팀 답변 {new Date(inquiryDetail.answer.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-800 whitespace-pre-line">{inquiryDetail.answer.content}</div>
              </div>
            ) : (
              <div className="text-xs text-gray-400">아직 답변이 등록되지 않았습니다.</div>
            )}
          </div>
        </main>
      )}

      {/* 문의 작성 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md relative">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-orange-500 text-xl"
              onClick={() => setShowModal(false)}
              aria-label="닫기"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-4">새 문의 작성</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="문의 제목을 입력해 주세요."
                className="border rounded px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
              <textarea
                placeholder="문의 내용을 자세히 입력해 주세요."
                className="border rounded px-3 py-2 min-h-[120px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
                required
              />
              {formError && <div className="text-red-500 text-xs">{formError}</div>}
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  취소
                </Button>
                <Button type="submit" variant="destructive" className="flex-1" disabled={mutation.isPending}>
                  {mutation.isPending ? '등록 중...' : '제출하기'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
