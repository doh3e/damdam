package com.ssafy.damdam.domain.counsels.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// 클라이언트 → 서버로 날아오는 최소 메시지 정보
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatInputDto {
	private String sender;
	private Boolean isVoice;
	private String audioUrl;
	private String message;
	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime timestamp;
}
