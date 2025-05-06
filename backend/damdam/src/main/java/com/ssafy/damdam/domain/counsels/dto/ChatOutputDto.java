package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 서버 처리 후 구독자(클라이언트)에게 전송할 메시지 정보
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatOutputDto {
	private Long counsId;
	private String talker;
	private boolean isVoice;
	private String content;

	/** ISO 형식 타임스탬프 (서버에서 추가) */
	private String timestamp;

	/** 남은 토큰 수 (서버에서 decrementToken 후) */
	private int tokenCount;

	/** 감정 분석 결과 예시: 0~100 사이 값 */
	private int happiness;
	private int angry;
	private int disgust;
	private int fear;
	private int neutral;
	private int sadness;
	private int surprise;
}
