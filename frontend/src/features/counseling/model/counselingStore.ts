/**
 * @file counselingStore.ts
 * 상담 기능과 관련된 클라이언트 상태 관리를 위한 Zustand 스토어입니다.
 * FSD 아키텍처에 따라 `features` 레이어의 `counseling` 슬라이스 내 `model`에 위치합니다.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'; // Zustand 개발자 도구 (선택 사항)
import { ChatMessage, CounselingDisplayStatus } from '@/entities/counseling/model/types';
import { WebSocketMessageType } from '@/shared/types/websockets'; // 웹소켓 메시지 타입 임포트

/**
 * 웹소켓 연결 상태를 나타내는 타입
 */
type WebsocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Counseling 스토어의 상태(State) 인터페이스
 */
interface CounselingState {
  /** 현재 진행 중인 상담 세션의 ID (없으면 null) */
  currentSessionId: string | null;
  /** 현재 상담 세션의 종료 여부 (true: 종료됨, false: 진행중, null: 아직 세션 정보 없음) */
  isCurrentSessionClosed: boolean | null;
  /** 현재 상담의 채팅 메시지 목록 */
  messages: ChatMessage[];
  /** 웹소켓 연결 상태 */
  websocketStatus: WebsocketStatus;
  /** AI가 현재 타이핑 중인지 여부 */
  isAiTyping: boolean;
  /** 스토어 레벨의 에러 메시지 (예: 웹소켓 연결 실패) */
  error: string | null;
  /** 새 메시지 입력 값 (controlled component 용도) */
  newMessageInput: string;
}

/**
 * Counseling 스토어의 액션(Actions) 인터페이스
 */
interface CounselingActions {
  /** 현재 상담 세션 ID를 설정합니다. */
  setCurrentSessionId: (sessionId: string | null) => void;
  /** 현재 상담 세션의 종료 여부를 설정합니다. */
  setIsCurrentSessionClosed: (isClosed: boolean | null) => void;
  /** 메시지 목록 전체를 설정합니다. (예: 상담방 진입 시 이전 대화 로드) */
  setMessages: (messages: ChatMessage[]) => void;
  /** 메시지 목록에 새 메시지를 추가합니다. */
  addMessage: (message: ChatMessage) => void;
  /** 특정 메시지를 업데이트합니다. (예: 피드백 추가) */
  updateMessage: (messageId: string, updatedFields: Partial<ChatMessage>) => void;
  /** 웹소켓 연결 상태를 설정합니다. */
  setWebsocketStatus: (status: WebsocketStatus) => void;
  /** AI 타이핑 상태를 설정합니다. */
  setIsAiTyping: (isTyping: boolean) => void;
  /** 스토어 에러 메시지를 설정합니다. */
  setError: (error: string | null) => void;
  /** 새 메시지 입력 값을 설정합니다. */
  setNewMessageInput: (input: string) => void;
  /** 스토어의 모든 상태를 초기값으로 리셋합니다. (예: 상담 종료 또는 새 상담 시작 시) */
  resetCounselingState: () => void;
}

/**
 * Counseling 스토어의 초기 상태값
 */
const initialState: CounselingState = {
  currentSessionId: null,
  isCurrentSessionClosed: null,
  messages: [],
  websocketStatus: 'idle',
  isAiTyping: false,
  error: null,
  newMessageInput: '',
};

/**
 * 상담(Counseling) 기능 관련 상태 및 액션을 관리하는 Zustand 스토어입니다.
 *
 * @see https://github.com/pmndrs/zustand
 */
export const useCounselingStore = create<CounselingState & CounselingActions>()(
  devtools(
    // Zustand 개발자 도구 연동 (Redux DevTools Extension 필요)
    (set, get) => ({
      ...initialState,

      setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),

      setIsCurrentSessionClosed: (isClosed) => set({ isCurrentSessionClosed: isClosed }),

      setMessages: (messages) => set({ messages }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updateMessage: (messageId, updatedFields) =>
        set((state) => ({
          messages: state.messages.map((msg) => (msg.id === messageId ? { ...msg, ...updatedFields } : msg)),
        })),

      setWebsocketStatus: (status) => set({ websocketStatus: status }),

      setIsAiTyping: (isTyping) => set({ isAiTyping: isTyping }),

      setError: (error) => set({ error }),

      setNewMessageInput: (input) => set({ newMessageInput: input }),

      resetCounselingState: () => set(initialState),
    }),
    { name: 'CounselingStore' } // Redux DevTools에 표시될 스토어 이름
  )
);
