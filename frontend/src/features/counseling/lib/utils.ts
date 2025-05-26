/**
 * @file frontend/src/features/counseling/lib/utils.ts
 * 상담 관련 유틸리티 함수들을 정의합니다.
 * FSD 아키텍처에 따라 `features` 레이어의 `counseling` 슬라이스 내 `lib`에 위치합니다.
 */
import { format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChatMessage, MessageType, SenderType, RecommendedContent } from '@/entities/counseling/model/types';

/**
 * 타임스탬프를 가독성 있는 시간 형식으로 포맷팅합니다.
 *
 * @param {number} timestamp - 포맷팅할 타임스탬프 (밀리초 단위)
 * @param {boolean} [includeDate=false] - 날짜를 포함할지 여부
 * @returns {string} 포맷팅된 시간 문자열
 */
export function formatMessageTime(timestamp: number, includeDate = false): string {
  const date = new Date(timestamp);

  if (includeDate) {
    if (isToday(date)) {
      return `오늘 ${format(date, 'a h:mm', { locale: ko })}`;
    } else if (isYesterday(date)) {
      return `어제 ${format(date, 'a h:mm', { locale: ko })}`;
    } else {
      return format(date, 'yyyy년 M월 d일 a h:mm', { locale: ko });
    }
  }

  return format(date, 'a h:mm', { locale: ko });
}

/**
 * 메시지의 타입과 발신자에 따라 스타일 클래스명을 결정합니다.
 *
 * @param {SenderType} sender - 메시지 발신자
 * @param {MessageType} messageType - 메시지 타입
 * @returns {{ containerClass: string, bubbleClass: string }} 컨테이너와 말풍선 스타일 클래스명
 */
export function getMessageStyleClasses(
  sender: SenderType,
  messageType: MessageType
): {
  containerClass: string;
  bubbleClass: string;
} {
  const isUser = sender === SenderType.USER;
  const isRecommendation = messageType === MessageType.RECOMMENDATION;

  const containerClass = isUser ? 'justify-end' : 'justify-start';

  let bubbleClass = '';
  if (isUser) {
    bubbleClass = 'bg-primary text-primary-foreground rounded-br-none';
  } else {
    // AI 메시지
    if (isRecommendation) {
      bubbleClass = 'bg-card text-card-foreground rounded-bl-none border border-border/50';
    } else {
      bubbleClass = 'bg-card text-card-foreground rounded-bl-none';
    }
  }

  return { containerClass, bubbleClass };
}

/**
 * 채팅 메시지 목록에서 연속된 같은 발신자의 메시지들을 그룹화합니다.
 *
 * @param {ChatMessage[]} messages - 채팅 메시지 배열
 * @returns {ChatMessage[][]} 발신자별로 그룹화된 메시지 2차원 배열
 */
export function groupMessagesBySender(messages: ChatMessage[]): ChatMessage[][] {
  if (!messages.length) return [];

  return messages.reduce<ChatMessage[][]>((groups, message) => {
    const lastGroup = groups[groups.length - 1];

    // 마지막 그룹이 없거나, 마지막 그룹의 첫 메시지와 현재 메시지의 발신자가 다르면 새 그룹 시작
    if (!lastGroup || lastGroup[0].sender !== message.sender) {
      groups.push([message]);
    } else {
      // 같은 발신자면 마지막 그룹에 추가
      lastGroup.push(message);
    }

    return groups;
  }, []);
}

/**
 * 채팅 메시지를 표시용으로 처리합니다.
 * 메시지 타입에 따라 추가 정보를 설정하거나 변환합니다.
 *
 * @param {ChatMessage} message - 처리할 메시지
 * @returns {ChatMessage} 처리된 메시지
 */
export function processMessageForDisplay(message: ChatMessage): ChatMessage {
  // 얕은 복사로 새 객체 생성 (원본 메시지 변경 방지)
  const processedMessage = { ...message };

  switch (message.messageType) {
    case MessageType.RECOMMENDATION:
      // 추천 메시지에 추가 처리 로직 (필요시)
      break;
    case MessageType.ERROR:
      // 오류 메시지 처리 로직 (필요시)
      if (!processedMessage.message && processedMessage.error) {
        processedMessage.message = `오류가 발생했습니다. (${processedMessage.error.message})`;
      }
      break;
    case MessageType.VOICE:
      // 음성 메시지 처리 로직 (필요시)
      break;
    default:
      // 기본 텍스트 메시지 처리 로직 (필요시)
      break;
  }

  return processedMessage;
}

/**
 * 추천 콘텐츠 목록에서 최대 개수만큼만 선택하여 반환합니다.
 *
 * @param {RecommendedContent[]} recommendations - 추천 콘텐츠 배열
 * @param {number} maxCount - 최대 표시 개수 (기본값: 3)
 * @returns {{ visibleItems: RecommendedContent[], hasMore: boolean }} 표시할 아이템과 더 있는지 여부
 */
export function getVisibleRecommendations(
  recommendations: RecommendedContent[] = [],
  maxCount = 3
): { visibleItems: RecommendedContent[]; hasMore: boolean } {
  if (!recommendations || !recommendations.length) {
    return { visibleItems: [], hasMore: false };
  }

  const hasMore = recommendations.length > maxCount;
  const visibleItems = recommendations.slice(0, maxCount);

  return { visibleItems, hasMore };
}
