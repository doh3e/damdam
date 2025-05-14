package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 클라이언트 → 서버로 날아오는 최소 메시지 정보
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatInputDto {
	private Boolean isVoice;
	private int messageOrder;
	private String message;
}
