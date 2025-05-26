package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 백엔드 → llm 채팅으로 전송할 정보들
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class LlmAiChatRequest {
	private UserContextDto userContext;
	private ChatInputDto messageInput;
	private EmotionDto emotion;
}
