/**
 * @file counselingStore.ts
 * 상담 기능과 관련된 클라이언트 상태 관리를 위한 Zustand 스토어입니다.
 * FSD 아키텍처에 따라 `features` 레이어의 `counseling` 슬라이스 내 `model`에 위치합니다.
 */
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { type Client as StompClient, type StompSubscription } from '@stomp/stompjs'; // StompJs 대신 StompClient, StompSubscription 직접 임포트
import { type ChatMessage, type CounselingSession, SenderType, MessageType } from '@/entities/counseling/model/types';

/**
 * 웹소켓 연결 상태를 나타내는 타입
 */
type WebsocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * 웹소켓 클라이언트 상태를 나타냅니다.
 */
export interface WebSocketState {
  stompClient: StompClient | null;
  isConnected: boolean;
  error: string | null;
  currentSubscription: StompSubscription | null;
}

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
  /** 현재 상담 세션의 상세 정보 */
  currentSessionDetails: CounselingSession | null;
  /** 마지막 사용자 활동 시간 */
  lastUserActivityTime: number | null;
  voiceMessageMap: Record<string, boolean>; // 메시지 키(예: 'counsId-messageOrder')와 isVoice 상태 매핑
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
  /** 현재 상담 세션의 상세 정보를 설정합니다. */
  setCurrentSessionDetails: (session: CounselingSession | null) => void;
  /** 마지막 사용자 활동 시간을 설정합니다. */
  setLastUserActivityTime: (time: number | null) => void;
  setVoiceStateForMessage: (messageKey: string, isVoice: boolean) => void;
  clearVoiceStateForSession: (sessionId: string) => void;
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
  currentSessionDetails: null,
  lastUserActivityTime: null,
  voiceMessageMap: {}, // 초기 voiceMessageMap
};

/**
 * 상담(Counseling) 기능 관련 상태 및 액션을 관리하는 Zustand 스토어입니다.
 *
 * @see https://github.com/pmndrs/zustand
 */
export const useCounselingStore = create<CounselingState & CounselingActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setCurrentSessionId: (sessionId) => {
          const oldSessionId = get().currentSessionId;
          if (oldSessionId && oldSessionId !== sessionId) {
            // 세션 ID가 변경되면, 메시지 목록과 AI 타이핑 상태를 초기화합니다.
            // 다른 상태들은 CounselingChatWindow.tsx 또는 각 기능별 로직에서 관리됩니다.
            set({
              messages: [],
              isAiTyping: false,
              // currentSessionId는 아래에서 sessionId로 설정됩니다.
              // isCurrentSessionClosed는 CounselingChatWindow의 useEffect에서 관리하므로 여기서 null이나 false로 설정하지 않습니다.
              // websocketStatus는 웹소켓 연결 시도 시 변경됩니다.
              // error는 에러 발생 시 설정됩니다.
              // newMessageInput은 입력 필드에서 관리됩니다.
              // currentSessionDetails는 API 응답으로 설정되므로 여기서 null로 설정하지 않습니다.
              // lastUserActivityTime은 CounselingChatWindow의 useEffect에서 관리하므로 여기서 null로 설정하지 않습니다.
            });
          }
          set({ currentSessionId: sessionId });
        },

        setIsCurrentSessionClosed: (isClosed) => set({ isCurrentSessionClosed: isClosed }),

        setMessages: (messages) => set({ messages }),

        addMessage: (message) =>
          set((state) => {
            let newMessages = [...state.messages];
            // 실제 AI 답변을 추가하기 전에 로딩 플레이스홀더를 제거
            if (message.sender === SenderType.AI && !message.isLoadingPlaceholder) {
              newMessages = newMessages.filter((msg) => !(msg.sender === SenderType.AI && msg.isLoadingPlaceholder));
            }
            return { messages: [...newMessages, message] };
          }),

        updateMessage: (messageId, updatedFields) =>
          set((state) => ({
            messages: state.messages.map((msg) => (msg.id === messageId ? { ...msg, ...updatedFields } : msg)),
          })),

        setWebsocketStatus: (status) => set({ websocketStatus: status }),

        setIsAiTyping: (isTyping) =>
          set((state) => {
            const currentCounsId = state.currentSessionId;
            if (isTyping && currentCounsId) {
              // AI 타이핑 시작: 로딩 플레이스홀더 추가
              const loadingMessage: ChatMessage = {
                id: `ai-loading-${Date.now()}`,
                counsId: currentCounsId,
                sender: SenderType.AI,
                message: 'AI가 답변을 생성 중입니다...', // ChatBubble에서 실제 UI로 대체됨
                timestamp: new Date().toISOString(),
                messageType: MessageType.TEXT, // 또는 새로운 MessageType.LOADING
                isLoadingPlaceholder: true,
                messageOrder:
                  state.messages.length > 0 ? state.messages[state.messages.length - 1].messageOrder + 0.001 : 0, // 정렬을 위해 임시 messageOrder
              };
              // 기존 메시지에서 로딩 플레이스홀더 제거 후 새 플레이스홀더 추가
              const messagesWithoutLoader = state.messages.filter(
                (msg) => !(msg.sender === SenderType.AI && msg.isLoadingPlaceholder)
              );
              return {
                isAiTyping: true,
                messages: [...messagesWithoutLoader, loadingMessage],
              };
            } else {
              // AI 타이핑 종료: 로딩 플레이스홀더 제거 (실제 메시지는 addMessage에서 추가)
              // addMessage에서 이미 플레이스홀더를 제거하므로, 여기서는 isAiTyping 상태만 변경해도 됨.
              // 하지만, 만약 AI 응답 없이 타이핑이 중단되는 경우(예: 네트워크 에러로 AI_TYPING_END 못 받을 때)를 대비해 여기서도 제거 로직을 넣을 수 있음.
              // 지금은 addMessage의 로직을 신뢰하고 isAiTyping만 false로 설정.
              // 실제 AI 메시지가 addMessage를 통해 들어오면, addMessage 내부에서 플레이스홀더가 정리됨.
              // 만약 AI_TYPING_END 시그널만 받고 실제 메시지가 안 온다면, 플레이스홀더가 남아있을 수 있음.
              // 이 부분을 보강하려면, isTyping이 false가 될 때 명시적으로 플레이스홀더를 제거하는 로직이 필요.
              // 예를 들어, 웹소켓에서 AI_TYPING_END를 받으면 setIsAiTyping(false) 호출과 함께,
              // 실제 메시지가 아직 안왔다면 여기서 플레이스홀더를 제거.
              // 현재는 useWebSocket에서 AI_TYPING_END 시 setIsAiTyping(false)만 호출.
              return {
                isAiTyping: false,
                // messages: state.messages.filter(msg => !(msg.sender === SenderType.AI && msg.isLoadingPlaceholder)),
              };
            }
          }),

        setError: (error) => set({ error }),

        setNewMessageInput: (input) => set({ newMessageInput: input }),

        setCurrentSessionDetails: (session) => set({ currentSessionDetails: session }),

        setLastUserActivityTime: (time) => set({ lastUserActivityTime: time }),

        setVoiceStateForMessage: (messageKey, isVoice) =>
          set((state) => ({
            voiceMessageMap: {
              ...state.voiceMessageMap,
              [messageKey]: isVoice,
            },
          })),

        clearVoiceStateForSession: (sessionId) =>
          set((state) => {
            const newMap = { ...state.voiceMessageMap };
            for (const key in newMap) {
              if (key.startsWith(`${sessionId}-`)) {
                delete newMap[key];
              }
            }
            return { voiceMessageMap: newMap };
          }),

        resetCounselingState: () => {
          // voiceMessageMap은 세션 간 유지될 수 있으므로 reset 시 초기화하지 않거나,
          // 필요시 명시적으로 현재 세션 ID에 해당하는 것만 지우도록 처리할 수 있습니다.
          // 여기서는 initialState로 리셋하므로 voiceMessageMap도 초기화됩니다.
          set(initialState);
        },
      }),
      {
        name: 'counseling-storage', // localStorage에 저장될 때 사용될 키 이름
        storage: createJSONStorage(() => localStorage), // localStorage 사용
        // partialize: (state) => ({ voiceMessageMap: state.voiceMessageMap }), // voiceMessageMap만 저장하려면 주석 해제
      }
    ),
    { name: 'CounselingStore' }
  )
);
