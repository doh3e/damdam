'use client';
import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReportCalendar } from '@/widgets/ReportCalendar/ReportCalendar';
import { deleteReport, getReports, updateReportTitle } from '@/entities/report/model/api';
import { SessionReportList } from '@/widgets/ReportList/SessionReportList';
import { PeriodReportList } from '@/widgets/ReportList/PeriodReportList';
import { format } from 'date-fns';
import type { SessionReport, PeriodReport } from '@/entities/report/model/types';
import Modal from '@/shared/ui/modal';

export default function ReportsPage() {
  const [category, setCategory] = useState<'상담별' | '기간별'>('상담별');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [keyword, setKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState('최신순');

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: number; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const formattedDate = selectedDate ? format(selectedDate, 'yyyyMMdd') : undefined;
  const apiCategory = category === '상담별' ? 'session' : 'period';

  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery<SessionReport[] | PeriodReport[]>({
    queryKey: ['reports', category, formattedDate, keyword],
    queryFn: () =>
      getReports({
        category: apiCategory,
        start: formattedDate,
        end: formattedDate,
        keyword,
      }),
  });

  const sortedReports = useMemo(() => {
    const copied = [...reports];
    return copied.sort((a, b) =>
      sortOrder === '최신순' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)
    );
  }, [reports, sortOrder]);

  const handleDeleteClick = (reportId: number) => {
    setDeleteTargetId(reportId);
  };

  const confirmDelete = async () => {
    if (deleteTargetId == null) return;
    try {
      await deleteReport(deleteTargetId);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch {
      alert('삭제 실패');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleEditClick = (reportId: number, currentTitle: string) => {
    setEditTarget({ id: reportId, title: currentTitle });
    setNewTitle(currentTitle);
  };

  const confirmEdit = async () => {
    if (!editTarget || !newTitle.trim()) return;
    try {
      await updateReportTitle(editTarget.id, newTitle.trim());
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch {
      alert('수정 실패');
    } finally {
      setEditTarget(null);
    }
  };

  return (
    <div className="bg-white min-h-screen max-w-xl mx-auto border rounded-xl shadow p-4">
      <h2 className="font-bold text-lg mb-4">나의 레포트</h2>

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
          상담별 레포트
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
        </>
      )}

      {/* 레포트 리스트 */}
      {category === '상담별' ? (
        <SessionReportList
          reports={sortedReports as SessionReport[]}
          isLoading={isLoading}
          onUpdate={handleEditClick}
          onDelete={handleDeleteClick}
        />
      ) : (
        <PeriodReportList reports={sortedReports as PeriodReport[]} isLoading={isLoading} />
      )}

      {/* 삭제 모달 */}
      {deleteTargetId !== null && (
        <Modal
          message="레포트 삭제"
          submessage="정말 이 레포트를 삭제하시겠습니까?"
          onClose={() => setDeleteTargetId(null)}
        >
          <div className="w-full flex gap-2">
            <button
              className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => setDeleteTargetId(null)}
            >
              취소
            </button>
            <button
              className="flex-1 py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600"
              onClick={confirmDelete}
            >
              삭제
            </button>
          </div>
        </Modal>
      )}

      {/* 수정 모달 */}
      {editTarget && (
        <Modal message="레포트 제목 수정" submessage="새 제목을 입력해주세요" onClose={() => setEditTarget(null)}>
          <div className="w-full space-y-4">
            <input
              className="w-full border rounded-lg px-4 py-2 text-sm"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="새 제목 입력"
            />
            <div className="flex gap-2">
              <button
                className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setEditTarget(null)}
              >
                취소
              </button>
              <button
                className="flex-1 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700"
                onClick={confirmEdit}
              >
                수정
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
