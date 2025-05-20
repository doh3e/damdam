package com.ssafy.damdam.domain.counsels.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRecordDto {
	private String sender;
	private Boolean isVoice;
	private int messageOrder;
	private String message;
	private LocalDateTime timestamp;
	private EmotionDto emotion;
	private int tokenCount;
}
