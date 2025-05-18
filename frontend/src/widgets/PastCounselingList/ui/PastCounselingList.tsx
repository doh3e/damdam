'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

// Tanstack Query 훅 임포트 (과거 상담 목록 조회)
import { useFetchPastCounselingSessions } from '@/entities/counseling/model/queries';
import { useDeleteCounselingSession, useUpdateCounselingTitle } from '@/entities/counseling/model/mutations'; // 상담 세션 삭제/수정 뮤테이션

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

  // --- Tanstack Query ---
  // 과거 상담 목록 조회 쿼리 (인증 상태에 따라 실행 여부 결정)
  const {
    data: pastSessions, // 조회된 과거 상담 목록 데이터
    isLoading, // 데이터 로딩 중 상태
    isError, // 데이터 로딩 에러 발생 상태
    error, // 발생한 에러 객체
    // staleTime, gcTime 등은 두 번째 인자인 options 객체로 전달
  } = useFetchPastCounselingSessions(
    {
      /* API 파라미터 객체 (필요시: page, limit 등) */
    },
    {
      staleTime: 10 * 60 * 1000, // 10분 동안 데이터를 신선하게 유지
      gcTime: 15 * 60 * 1000, // 15분 동안 캐시 유지
      enabled: !!token, // 인증 토큰이 있을 때만 쿼리 실행
    }
  );

  // 인증 에러 처리: 인증 실패 시 로그인 페이지로 리디렉션
  const handleAuthError = () => {
    router.push('/login');
  };

  // 상담 세션 삭제 처리
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
    <Card className="w-full h-[500px] flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* 상단: "대화" 텍스트와 새 대화 시작 버튼 */}
      <CardHeader className="p-4 border-b flex-shrink-0 flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: '#222222' }}>
          상담 기록
        </h2>
        <br />
        <StartCounselingButton />
      </CardHeader>

      {/* 중앙: 과거 상담 목록 (스크롤 가능 영역) */}
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full w-full p-4">
          {/* 1. 로딩 상태 처리 */}
          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          )}

          {/* 2. 에러 상태 처리 */}
          {isError && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>
                상담 목록을 불러오는 중 오류가 발생했습니다.
                {error?.message?.includes('신뢰할 수 없는 자격증명') ? (
                  <div className="mt-2">
                    <p>로그인이 필요합니다.</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleAuthError}>
                      로그인하기
                    </Button>
                  </div>
                ) : (
                  error?.message
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* 3. 데이터 로딩 성공 시 */}
          {!isLoading && !isError && (
            <div className="space-y-2 min-h-[300px]">
              {/* 3a. 목록이 비어있을 경우 */}
              {pastSessions && pastSessions.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                  <MessageSquareText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm">과거 상담 내역이 없습니다.</p>
                  <p className="text-xs">새 상담을 시작해보세요.</p>
                </div>
              )}

              {/* 3b. 목록이 있을 경우 */}
              {pastSessions &&
                pastSessions.length > 0 &&
                pastSessions.map((session) => {
                  // counsId가 있는지 확인하고 유효한 키 생성
                  if (!session?.counsId) return null;

                  const sessionId = String(session.counsId);
                  const isActive = currentViewingCounsId === sessionId;

                  return (
                    <div key={sessionId} className="relative mb-2">
                      <div
                        className={`block rounded-lg transition-colors pr-16 ${
                          isActive
                            ? 'bg-pale-coral-pink/30 dark:bg-pale-coral-pink/20'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => router.push(`/counseling/${sessionId}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <PastCounselingListItem
                          session={session}
                          isActive={isActive}
                          showTitle={true} // 제목 표시 옵션 추가
                        />
                      </div>
                      {/* 수정 버튼 */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-14 transform -translate-y-1/2 h-6 w-6 rounded-full opacity-70 hover:opacity-100 hover:bg-blue-100 hover:text-blue-600 z-10"
                        onClick={(e) => handleOpenTitleEditModal(e, session)}
                        title="상담 제목 수정하기"
                      >
                        <Edit size={16} />
                      </Button>
                      {/* 삭제 버튼 */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 h-6 w-6 rounded-full opacity-70 hover:opacity-100 hover:bg-red-100 hover:text-red-600 z-10"
                        onClick={(e) => handleDeleteSession(e, session.counsId)}
                        title="상담 삭제하기"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  );
                })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* 제목 수정 모달 */}
      <Dialog open={titleEditModalOpen} onOpenChange={setTitleEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>상담 제목 수정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right col-span-1">
                제목
              </label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="col-span-3"
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
      </Dialog>
    </Card>
  );
}

// 기본 export 추가
export default PastCounselingList;
