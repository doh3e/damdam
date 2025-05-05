package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 클라이언트 → 서버로 날아오는 최소 메시지 정보
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatInputDto {
	/** 상담방 ID (Redis key 로도 사용) */
	private Long counsId;

	/** 발화자 (유저 or AI) */
	private String talker;

	/** 음성 상담 여부 */
	private boolean isVoice;

	/** 실제 대화 내용 */
	private String content;
}
