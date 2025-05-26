package com.ssafy.damdam.domain.counsels.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

// 클라이언트 → 서버로 날아오는 최소 메시지 정보
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatInputDto {
	private Boolean isVoice;
	private int messageOrder;
	private String message;
}
