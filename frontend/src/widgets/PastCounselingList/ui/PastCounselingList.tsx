'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useQueryClient, useQueries, type UseQueryResult } from '@tanstack/react-query';
import Modal from '@/shared/ui/modal'; // modal 컴포넌트

// Tanstack Query 훅 임포트 (과거 상담 목록 조회)
import { useFetchPastCounselingSessions } from '@/entities/counseling/model/queries';
import { useDeleteCounselingSession, useUpdateCounselingTitle } from '@/entities/counseling/model/mutations'; // 상담 세션 삭제/수정 뮤테이션
import { useFetchReports, reportQueryKeys } from '@/entities/report/model/queries';
import { getPeriodicReportDetail } from '@/entities/report/model/api'; // getPeriodicReportDetail 직접 임포트
import type { SessionReport, PeriodReport, PeriodReportDetail } from '@/entities/report/model/types';

// 엔티티(Entity) 컴포넌트 임포트
import PastCounselingListItem from '@/entities/counseling/ui/PastCounselingListItem';

// 피처(Feature) 컴포넌트 임포트
import StartCounselingButton from '@/features/counseling/ui/StartCounselingButton';

// Zustand 스토어 임포트 (현재 활성 세션 ID 확인용)
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { useAuthStore } from '@/app/store/authStore'; // 인증 스토어 추가

// Shadcn/ui 컴포넌트 임포트
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/ui/card';
import { ScrollArea } from '@/shared/ui/scroll-area'; // 목록 스크롤용
import { Skeleton } from '@/shared/ui/skeleton'; // 로딩 상태 표시용
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'; // 에러 메시지 표시용
import { MessageSquareText, Terminal, AlertCircle, Trash2, Edit, PlusCircle } from 'lucide-react'; // 아이콘 추가
import { Button } from '@/shared/ui/button'; // Button 컴포넌트 임포트
import { Input } from '@/shared/ui/input'; // 제목 수정용 Input 컴포넌트 추가
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/shared/ui/dialog'; // 모달 다이얼로그 추가

/**
 * @typedef {object} PastCounselingListProps
 * // PastCounselingList 컴포넌트에 전달될 props 타입을 정의합니다. (현재는 props 없음)
 */

/**
 * PastCounselingList 위젯 컴포넌트
 *
 * @description
 * 사용자의 과거 상담 목록을 표시하고, 새 상담을 시작하는 버튼을 제공하는 위젯입니다.
 * Tanstack Query를 사용하여 과거 상담 목록 데이터를 비동기적으로 로드하고 관리합니다.
 * 각 상담 목록 아이템은 클릭 시 해당 상담 상세 페이지로 이동합니다.
 *
 * @param {PastCounselingListProps} props - 컴포넌트 props
 * @returns {JSX.Element} PastCounselingList 컴포넌트의 JSX 요소
 */
export function PastCounselingList() {
  // --- Hooks ---
  const params = useParams(); // 현재 URL 파라미터 가져오기
  const router = useRouter(); // 라우터 추가
  const queryClient = useQueryClient();
  const { token } = useAuthStore(); // 인증 토큰 가져오기
  const { mutate: deleteSession } = useDeleteCounselingSession(); // 상담 세션 삭제 뮤테이션
  const { mutate: updateTitle } = useUpdateCounselingTitle(); // 상담 제목 수정 뮤테이션 추가

  // 상태 관리 - 제목 수정 모달
  const [titleEditModalOpen, setTitleEditModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [newTitle, setNewTitle] = useState('');

  // URL 파라미터에서 현재 보고 있는 상담 ID 추출 (활성 상태 표시에 사용)
  const currentViewingCounsIdParam = params.couns_id;
  const currentViewingCounsId = Array.isArray(currentViewingCounsIdParam)
    ? currentViewingCounsIdParam[0]
    : currentViewingCounsIdParam;

  // --- Tanstack Query (과거 상담 목록) ---
  const {
    data: pastSessions, // 조회된 과거 상담 목록 데이터
    isLoading: isLoadingPastSessions, // 로딩 상태 변수명 변경
    isError: isErrorPastSessions, // 에러 상태 변수명 변경
    error: errorPastSessions, // 에러 객체 변수명 변경
  } = useFetchPastCounselingSessions(
    {},
    {
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!token,
    }
  );

  // --- 레포트 데이터 조회 로직 ---
  // 1. 세션 레포트 목록 조회
  const { data: sessionReportsData, isLoading: isLoadingSessionReportsData } = useFetchReports(
    { category: 'session' },
    { enabled: !!token }
  );

  // 2. 기간별 레포트 목록 조회
  const { data: periodReportsData, isLoading: isLoadingPeriodReportsData } = useFetchReports(
    { category: 'period' },
    { enabled: !!token }
  );

  // 3. 기간별 레포트 상세 정보 조회 (useQueries를 사용하여 동적으로 여러 쿼리 실행)
  const periodReportDetailResults = useQueries<UseQueryResult<PeriodReportDetail, Error>[]>({
    // useQueries 제네릭 타입 수정
    queries: periodReportsData
      ? (periodReportsData as PeriodReport[]).map((pReport) => ({
          // periodReportsData 사용 및 타입 단언
          queryKey: reportQueryKeys.periodicDetail(pReport.preportId),
          queryFn: () => getPeriodicReportDetail(pReport.preportId),
          enabled: !!token && !!pReport.preportId,
        }))
      : [],
  });

  // 4. 모든 레포트 정보를 취합하여 reportedCounsIds Set 업데이트 (useMemo 사용으로 최적화)
  const reportedCounsIdsSet = useMemo(() => {
    const newReportedCounsIds = new Set<number>();

    if (sessionReportsData) {
      (sessionReportsData as SessionReport[]).forEach((report) => {
        if (report.counsId) {
          newReportedCounsIds.add(report.counsId);
        }
      });
    }

    periodReportDetailResults.forEach((queryResult) => {
      if (queryResult.isSuccess && queryResult.data) {
        if (queryResult.data.counselings && Array.isArray(queryResult.data.counselings)) {
          queryResult.data.counselings.forEach((counseling) => {
            if (counseling.counsId) {
              newReportedCounsIds.add(counseling.counsId);
            }
          });
        }
      }
    });
    return newReportedCounsIds;
  }, [sessionReportsData, periodReportDetailResults]);

  // 레포트 정보 로딩 중 상태
  const isLoadingReports =
    isLoadingSessionReportsData || isLoadingPeriodReportsData || periodReportDetailResults.some((q) => q.isLoading);

  // 인증 에러 처리: 인증 실패 시 로그인 페이지로 리디렉션
  const handleAuthError = () => {
    router.push('/login');
  };

  // 상담 세션 삭제 처리

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<any>(null);
  const handleConfirmDelete = () => {
    if (!sessionToDelete?.counsId) return;
    const sessionId = String(sessionToDelete.counsId);

    deleteSession(sessionId, {
      onSuccess: () => {
        console.log('상담 세션이 삭제되었습니다.');
        if (currentViewingCounsId === sessionId) {
          router.push('/counseling');
        }
        setDeleteConfirmModalOpen(false);
      },
      onError: (error: Error) => {
        console.error('상담 세션 삭제 실패:', error);
        alert('상담 삭제 중 오류가 발생했습니다.');
      },
    });
  };

  const handleDeleteSession = (e: React.MouseEvent, counsId: string | number) => {
    e.preventDefault(); // 링크 클릭 방지
    e.stopPropagation(); // 이벤트 버블링 방지

    // counsId가 string인지 확인
    const sessionId = String(counsId);

    if (!sessionId) {
      console.error('상담 ID가 없습니다.');
      alert('상담 ID가 없어 삭제할 수 없습니다.');
      return;
    }

    if (window.confirm('정말로 이 상담 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteSession(sessionId, {
        onSuccess: () => {
          console.log('상담 세션이 성공적으로 삭제되었습니다.');
          // 만약 현재 보고 있는 세션이 삭제된 세션이라면 목록 페이지로 리디렉션
          if (currentViewingCounsId === sessionId) {
            router.push('/counseling');
          }
        },
        onError: (error: Error) => {
          console.error('상담 세션 삭제 중 오류가 발생했습니다:', error);
          alert('상담 세션 삭제 중 오류가 발생했습니다.');
        },
      });
    }
  };

  // 제목 수정 모달 열기
  const handleOpenTitleEditModal = (e: React.MouseEvent, session: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSession(session);
    setNewTitle(session.counsTitle || '');
    setTitleEditModalOpen(true);
  };

  // 제목 수정 제출
  const handleTitleUpdate = () => {
    if (!selectedSession || !selectedSession.counsId || !newTitle.trim()) {
      alert('세션 정보가 없거나 제목이 비어있습니다.');
      return;
    }

    const sessionId = String(selectedSession.counsId);
    updateTitle(
      {
        counsId: sessionId,
        payload: { counsTitle: newTitle.trim() },
      },
      {
        onSuccess: () => {
          console.log('상담 제목이 성공적으로 변경되었습니다.');
          setTitleEditModalOpen(false);
        },
        onError: (error: Error) => {
          console.error('상담 제목 변경 중 오류가 발생했습니다:', error);
          alert('상담 제목 변경 중 오류가 발생했습니다.');
        },
      }
    );
  };

  // --- 렌더링 로직 ---
  // 로그인하지 않은 경우의 UI
  if (!token) {
    return (
      <Card className="w-full h-full flex flex-col border-r border-gray-200 dark:border-gray-700">
        <CardHeader className="p-4 border-b">
          <h2 className="text-xl font-semibold" style={{ color: '#222222' }}>
            대화
          </h2>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-0">
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">로그인이 필요합니다</h3>
            <p className="text-muted-foreground mb-4">상담 내역을 확인하려면 로그인해주세요.</p>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <StartCounselingButton /> {/* 버튼에서 로그인 여부를 체크하고 처리함 */}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden bg-white">
      {/* 상단: "대화" 텍스트와 새 대화 시작 버튼 */}
      <CardHeader className="p-4 border-b flex-shrink-0 flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: '#222222' }}>
          상담 기록
        </h2>
        <br />
        <StartCounselingButton />
      </CardHeader>

      {/* 중앙: 과거 상담 목록 (스크롤 가능 영역) */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full w-full p-4">
          {isLoadingPastSessions ? (
            // 로딩 중 스켈레톤 UI
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 mb-2 rounded-lg bg-muted">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : isErrorPastSessions ? (
            // 에러 발생 시 알림
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류 발생</AlertTitle>
              <AlertDescription>
                상담 목록을 불러오는 중 오류가 발생했습니다: {errorPastSessions?.message || '알 수 없는 오류'}
              </AlertDescription>
            </Alert>
          ) : pastSessions && pastSessions.length > 0 ? (
            // 상담 목록 렌더링
            pastSessions.map((session) => {
              const isReported = reportedCounsIdsSet.has(session.counsId);
              const isActiveSession = currentViewingCounsId === String(session.counsId);

              return (
                <div key={session.counsId} className="flex items-center justify-between mb-2 group">
                  <Link
                    href={`/counseling/${session.counsId}`}
                    passHref
                    className="flex-grow" // Link가 영역을 차지하도록
                  >
                    <PastCounselingListItem session={session} isActive={isActiveSession} showTitle={true} />
                  </Link>
                  <div className="flex items-center space-x-1 opacity-100 transition-opacity pr-2">
                    {isLoadingReports ? (
                      <Skeleton className="h-6 w-12 rounded-md" /> // 버튼 영역 스켈레톤
                    ) : isReported ? (
                      // 레포트가 있는 경우: 수정 버튼만 표시 (오른쪽 끝)
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleOpenTitleEditModal(e, session)}
                        title="상담 제목 수정"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : (
                      // 레포트가 없는 경우: 수정 버튼과 삭제 버튼 표시
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleOpenTitleEditModal(e, session)}
                          title="상담 제목 수정"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          // onClick={(e) => handleDeleteSession(e, session.counsId)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSessionToDelete(session);
                            setDeleteConfirmModalOpen(true);
                          }}
                          title="상담 삭제"
                          className="text-destructive hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            // 상담 내역이 없는 경우
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageSquareText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">상담 내역이 없습니다.</h3>
              <p className="text-muted-foreground">새로운 상담을 시작해보세요!</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* 제목 수정 모달 */}
      {titleEditModalOpen && (
        <Modal
          message="상담 제목 수정"
          submessage="30자 이내로 새로운 제목을 입력해주세요"
          onClose={() => setTitleEditModalOpen(false)}
        >
          <div className="w-full flex flex-col space-y-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="새 제목 입력"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              maxLength={30}
            />
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setTitleEditModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
              >
                취소
              </button>
              <button
                onClick={handleTitleUpdate}
                className="px-4 py-2 rounded-lg bg-[#e24b4b] text-white hover:scale-105 transition text-sm"
                disabled={!newTitle.trim()}
              >
                저장
              </button>
            </div>
          </div>
        </Modal>
      )}
      {deleteConfirmModalOpen && (
        <Modal
          message="상담 기록 삭제"
          submessage="정말로 이 상담 기록을 삭제하시겠습니까?<br/>삭제된 데이터는 복구할 수 없습니다."
          onClose={() => setDeleteConfirmModalOpen(false)}
        >
          <div className="w-full flex justify-center space-x-2">
            <button
              onClick={() => setDeleteConfirmModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
            >
              취소
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-lg bg-[#e24b4b] text-white hover:scale-105 transition text-sm"
            >
              삭제
            </button>
          </div>
        </Modal>
      )}
      {/* <Dialog open={titleEditModalOpen} onOpenChange={setTitleEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>상담 제목 수정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center items-center gap-4">
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-3/4"
                maxLength={30}
                placeholder="30자 이내로 입력해주세요"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleTitleUpdate} disabled={!newTitle.trim()}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </Card>
  );
}

// 기본 export 추가
export default PastCounselingList;
