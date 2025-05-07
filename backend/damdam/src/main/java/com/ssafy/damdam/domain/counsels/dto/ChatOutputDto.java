package com.ssafy.damdam.domain.counsels.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 서버 처리 후 구독자(클라이언트)에게 전송할 메시지 정보
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatOutputDto {
	private String sender;
	private Boolean isVoice;
	private String message;

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

	public ChatOutputDto(Long roomId, String sender, boolean voice, String message, String string, int tokenCount, int i, int i1, int i2, int i3, int i4, int i5) {
	}
}
