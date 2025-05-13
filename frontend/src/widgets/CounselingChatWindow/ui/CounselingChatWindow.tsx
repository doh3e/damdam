'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // 라우터 추가
import { useQueryClient } from '@tanstack/react-query'; // Tanstack Query 클라이언트 인스턴스 사용

// Zustand 스토어 및 액션 임포트
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { useAuthStore } from '@/app/store/authStore'; // 인증 스토어 추가

// Tanstack Query 훅 임포트 (상담 세션 상세 정보 조회)
import { useFetchCounselingSessionDetail } from '@/entities/counseling/model/queries';

// 웹소켓 커스텀 훅 임포트
import { useWebSocket } from '@/shared/hooks/useWebSocket';

// 필요한 피처(Feature) 컴포넌트 임포트
import EditCounselingTitleButton from '@/features/counseling/ui/EditCounselingTitleButton';
import EndCounselingButton from '@/features/counseling/ui/EndCounselingButton';
import CreateReportButton from '@/features/counseling/ui/CreateReportButton';
import SendMessageForm from '@/features/counseling/ui/SendMessageForm';

// 필요한 위젯(Widget) 컴포넌트 임포트
import ChatMessageList from '@/widgets/ChatMessageList/ui/ChatMessageList'; // 이미 구현된 메시지 목록 위젯

// Shadcn/ui 컴포넌트 임포트 (필요에 따라 추가)
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton'; // 로딩 상태 표시용
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'; // 에러 메시지 표시용
import { Terminal, AlertCircle } from 'lucide-react'; // 아이콘 추가
import { Button } from '@/shared/ui/button'; // 버튼 컴포넌트 추가

/**
 * @typedef {object} CounselingChatWindowProps
 * // CounselingChatWindow 컴포넌트에 전달될 props 타입을 정의합니다. (현재는 props 없음)
 */

/**
 * CounselingChatWindow 위젯 컴포넌트
 *
 * @description
 * AI 상담 채팅 화면의 메인 인터페이스를 구성하는 위젯입니다.
 * 상담 제목 표시 및 수정, 상담 종료, 보고서 생성 버튼, 채팅 메시지 목록, 메시지 입력 폼을 포함합니다.
 * URL 파라미터로부터 상담 ID(`couns_id`)를 받아 해당 세션의 데이터를 로드하고 웹소켓 연결을 관리합니다.
 *
 * @param {CounselingChatWindowProps} props - 컴포넌트 props
 * @returns {JSX.Element} CounselingChatWindow 컴포넌트의 JSX 요소
 */
export function CounselingChatWindow() {
  // --- Hooks ---
  const params = useParams(); // URL 파라미터 훅
  const router = useRouter(); // 라우터 추가
  const queryClient = useQueryClient(); // Tanstack Query 클라이언트 인스턴스
  const { token } = useAuthStore(); // 인증 토큰 가져오기

  const { setCurrentSessionId, setMessages, setIsCurrentSessionClosed, currentSessionId, messages, isAiTyping } =
    useCounselingStore();

  // URL 파라미터에서 상담 ID 추출
  const couns_id_param = params.couns_id;
  const couns_id = Array.isArray(couns_id_param) ? couns_id_param[0] : couns_id_param;

  // 인증 에러 처리: 인증 실패 시 로그인 페이지로 리디렉션
  const handleAuthError = () => {
    router.push('/login');
  };

  // --- Tanstack Query ---
  // 상담 세션 상세 정보 조회 쿼리
  const {
    data: sessionDetail, // 조회된 데이터 (세션 정보 + 메시지 목록)
    isLoading, // 데이터 로딩 중 상태
    isError, // 데이터 로딩 에러 발생 상태
    error, // 발생한 에러 객체
    // couns_id가 string | undefined 이므로, undefined일 경우 !!couns_id 가 false가 됨
    // enabled 옵션 제거 (타입 오류 및 couns_id 유효성 검사로 대체 가능)
  } = useFetchCounselingSessionDetail(couns_id || '', {
    staleTime: 10 * 60 * 1000, // 10분 동안 데이터를 신선하게 유지
    gcTime: 15 * 60 * 1000, // 15분 동안 캐시 유지
    // enabled 옵션 제거 - 타입 오류 발생 (타입 정의에서 Omit으로 제외됨)
    // 토큰과 couns_id 유효성 확인은 컴포넌트 조건부 렌더링에서 처리
  });

  // --- Zustand Store 업데이트 ---
  // 컴포넌트 마운트 또는 couns_id 변경 시 Zustand 스토어 상태 초기화/업데이트
  useEffect(() => {
    if (couns_id && couns_id !== currentSessionId) {
      // 이전 세션 정보 및 메시지 초기화
      setCurrentSessionId(couns_id); // string 타입 전달
      setMessages([]); // 새 세션 로드 전 메시지 비우기
      setIsCurrentSessionClosed(false); // 초기값 설정
      // Tanstack Query 캐시 무효화 (선택적: 필요 시 이전 세션 캐시 제거)
      // queryClient.invalidateQueries({ queryKey: ['counselingSessionDetail', currentSessionId] });
    }
    // currentSessionId가 변경될 때도 useEffect가 실행되도록 의존성 배열에 추가
  }, [couns_id, currentSessionId, setCurrentSessionId, setMessages, setIsCurrentSessionClosed, queryClient]);

  // --- Tanstack Query 성공 시 Zustand 스토어 업데이트 ---
  // 데이터 로딩 성공 시 스토어에 메시지 목록과 세션 상태 업데이트
  useEffect(() => {
    if (sessionDetail) {
      // API 명세서 및 entities/counseling/model/api.ts의 CounselingSessionWithMessages 타입 기반으로 데이터 구조 접근
      const messagesFromServer = sessionDetail.messages || []; // messages 필드가 메시지 배열
      // session 객체 안의 is_closed 필드 사용 (snake_case)
      const isClosedFromServer = sessionDetail.session?.is_closed || false;

      setMessages(messagesFromServer);
      setIsCurrentSessionClosed(isClosedFromServer);
    }
  }, [sessionDetail, setMessages, setIsCurrentSessionClosed]);

  // --- WebSocket 연결 ---
  // useWebSocket 훅 사용법에 맞게 수정
  // 콜백 함수 제거, 옵션 객체 전달 방식으로 변경
  // 웹소켓 메시지 수신 및 스토어 업데이트는 useWebSocket 훅 내부에서 처리한다고 가정
  const { isConnected, error: wsError } = useWebSocket({
    counsId: couns_id || null, // undefined 대신 null 전달
    authToken: token, // 인증 토큰 전달
    autoConnect: !!token, // 인증 토큰이 있을 때만 자동 연결
  });

  // 웹소켓 에러 처리
  useEffect(() => {
    if (wsError) {
      console.error('WebSocket Error:', wsError);
      if (typeof wsError === 'string' && wsError.includes('신뢰할 수 없는 자격증명')) {
        handleAuthError();
      }
    }
  }, [wsError]);

  // --- 로그인되지 않은 경우 UI ---
  if (!token) {
    return (
      <Card className="w-full h-[calc(100vh-theme(space.16))] flex flex-col">
        <CardContent className="flex flex-col items-center justify-center flex-grow p-8">
          <AlertCircle className="w-16 h-16 text-orange-500 mb-6" />
          <h2 className="text-xl font-semibold mb-4">로그인이 필요합니다</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            상담 채팅 화면에 접근하려면 로그인이 필요합니다. 로그인 후 이용해주세요.
          </p>
          <Button onClick={handleAuthError} className="w-full max-w-xs">
            로그인 페이지로 이동
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- 렌더링 로직 ---

  // 1. 로딩 상태 처리
  if (isLoading) {
    return (
      <Card className="w-full h-[calc(100vh-theme(space.16))] flex flex-col">
        {/* theme(space.16)은 헤더 높이 등 상단 공간을 의미 (Tailwind 설정 따라 조정) */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <Skeleton className="h-6 w-3/5" /> {/* 제목 스켈레톤 */}
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" /> {/* 버튼 스켈레톤 */}
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {/* 메시지 목록 스켈레톤 */}
          <div className="flex items-start space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-16 w-3/4 rounded-lg" />
          </div>
          <div className="flex items-start justify-end space-x-2">
            <Skeleton className="h-12 w-3/4 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex items-start space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-20 w-2/4 rounded-lg" />
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <Skeleton className="h-10 w-full" /> {/* 입력 폼 스켈레톤 */}
        </CardFooter>
      </Card>
    );
  }

  // 2. 에러 상태 처리
  if (isError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(space.16))]">
        <Alert variant="destructive" className="w-1/2">
          <Terminal className="h-4 w-4" />
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>
            상담 정보를 불러오는 중 오류가 발생했습니다:
            {error?.message?.includes('신뢰할 수 없는 자격증명') ? (
              <div className="mt-2">
                <p>인증에 실패했습니다. 로그인이 필요합니다.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleAuthError}>
                  로그인하기
                </Button>
              </div>
            ) : (
              error?.message || '알 수 없는 오류'
            )}
            <br />
            잠시 후 다시 시도해주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // couns_id가 없는 경우 (예: /counseling 페이지 처음 진입) 처리
  if (!couns_id) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(space.16))]">
        {/* 여기에 적절한 플레이스홀더나 안내 메시지 추가 */}
        <p>상담 세션을 선택해주세요.</p>
      </div>
    );
  }

  // 3. 데이터 로딩 성공 시 실제 UI 렌더링
  // CounselingSessionWithMessages 타입 정의에 맞춰 접근 (`sessionDetail.session`)
  const counselingTitle = sessionDetail?.session?.couns_title || '상담 제목 없음';
  const isClosed = sessionDetail?.session?.is_closed || false;

  return (
    <Card className="w-full h-[calc(100vh-theme(space.16))] flex flex-col bg-soft-ivory dark:bg-gray-900">
      {/* 상단: 상담 제목 및 액션 버튼 */}
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b bg-white dark:bg-gray-800 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal-black dark:text-white truncate mr-2">{counselingTitle}</h2>
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* 상담 제목 수정 버튼 (EndCounselingButton 등 피처 컴포넌트 사용) */}
          {/* couns_id가 string 타입이므로 숫자 0과 비교 제거 */}
          {/* 실제 EditCounselingTitleButton 컴포넌트의 props 확인 필요 */}
          {couns_id && <EditCounselingTitleButton counsId={couns_id} currentTitle={counselingTitle} />}
          {/* 상담 종료 버튼 */}
          {/* 실제 EndCounselingButton 컴포넌트의 props 확인 필요 */}
          {couns_id && !isClosed && <EndCounselingButton currentCounsId={couns_id} />}
          {/* 보고서 생성 버튼 */}
          {/* isSessionClosed prop 추가 */}
          {/* 실제 CreateReportButton 컴포넌트의 props 확인 필요 */}
          {couns_id && isClosed && <CreateReportButton counsId={couns_id} isSessionClosed={isClosed} />}
        </div>
      </CardHeader>

      {/* 중앙: 채팅 메시지 목록 */}
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth">
        {/* ChatMessageList 위젯에 messages prop 전달 */}
        <ChatMessageList messages={messages} />
        {/* AI 타이핑 인디케이터 */}
        {isAiTyping && (
          <div className="flex items-center justify-start space-x-2 animate-pulse p-2">
            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animation-delay-200"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animation-delay-400"></div>
            <span className="text-xs text-gray-500 ml-1">답변중...</span>
          </div>
        )}
      </CardContent>

      {/* 하단: 메시지 입력 폼 */}
      <CardFooter className="p-3 border-t bg-white dark:bg-gray-800">
        {/* SendMessageForm 피처 컴포넌트 (상담 ID 전달) */}
        {/* isClosed 상태에 따라 입력 폼 비활성화 */}
        <SendMessageForm currentCounsId={couns_id} disabled={isClosed} />
      </CardFooter>
    </Card>
  );
}

// 기본 export 추가 (Next.js App Router convention)
export default CounselingChatWindow;
