package com.ssafy.damdam.domain.counsels.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

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

	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime timestamp;

	private int tokenCount;

	private int happiness;
	private int angry;
	private int disgust;
	private int fear;
	private int neutral;
	private int sadness;
	private int surprise;

}
