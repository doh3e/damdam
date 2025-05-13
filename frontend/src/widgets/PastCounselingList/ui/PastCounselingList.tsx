'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation'; // 라우터 추가

// Tanstack Query 훅 임포트 (과거 상담 목록 조회)
import { useFetchPastCounselingSessions } from '@/entities/counseling/model/queries';

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
import { MessageSquareText, Terminal, AlertCircle } from 'lucide-react'; // 아이콘 추가
import { Button } from '@/shared/ui/button'; // Button 컴포넌트 임포트

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

  // --- 렌더링 로직 ---
  // 로그인하지 않은 경우의 UI
  if (!token) {
    return (
      <Card className="w-full h-full flex flex-col border-r border-gray-200 dark:border-gray-700">
        <CardHeader className="p-4 border-b">
          <h2 className="text-xl font-semibold text-charcoal-black dark:text-white">대화</h2>
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
    <Card className="w-full h-full flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* 상단: "대화" 텍스트 */}
      <CardHeader className="p-4 border-b">
        <h2 className="text-xl font-semibold text-charcoal-black dark:text-white">대화</h2>
      </CardHeader>

      {/* 중앙: 과거 상담 목록 (스크롤 가능 영역) */}
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
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
            <div className="space-y-2">
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
                pastSessions.map((session) => (
                  // 각 상담 아이템을 Link로 감싸서 클릭 시 해당 상담 상세 페이지로 이동
                  // API 명세서 및 CounselingSession 타입 정의 기반으로 props 전달 (snake_case 사용)
                  <Link
                    key={session.couns_id}
                    href={`/counseling/${session.couns_id}`}
                    passHref
                    legacyBehavior // Link 안에 다른 컴포넌트(PastCounselingListItem)가 있을 때 필요
                  >
                    <a // PastCounselingListItem 컴포넌트 자체가 Link 역할을 할 수 있도록 내부에서 Link 사용 지양
                      className={`block rounded-lg transition-colors ${
                        // 현재 보고 있는 상담 ID와 일치하면 활성 스타일 적용
                        currentViewingCounsId === session.couns_id // snake_case로 수정
                          ? 'bg-pale-coral-pink/30 dark:bg-pale-coral-pink/20'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {/* PastCounselingListItem에 session 객체 전체를 넘기거나 필요한 props를 snake_case로 전달 */}
                      {/* PastCounselingListItem 내부에서 props를 받아 처리하도록 수정 필요 */}
                      <PastCounselingListItem
                        session={session} // session 객체 전체 전달
                        isActive={currentViewingCounsId === session.couns_id} // snake_case로 수정
                        // 아래는 session 객체에 포함되어 있으므로 PastCounselingListItem에서 session.xxx로 접근
                        // counsId={session.couns_id}
                        // counsTitle={session.couns_title}
                        // createdAt={session.created_at}
                        // isClosed={session.is_closed}
                      />
                    </a>
                  </Link>
                ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* 하단: 새 상담 시작 버튼 */}
      <CardFooter className="p-4 border-t">
        {/* StartCounselingButton 피처 컴포넌트 */}
        <StartCounselingButton />
      </CardFooter>
    </Card>
  );
}

// 기본 export 추가
export default PastCounselingList;
