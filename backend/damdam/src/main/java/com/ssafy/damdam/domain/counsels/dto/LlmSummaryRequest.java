package com.ssafy.damdam.domain.counsels.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmSummaryRequest {

	private Long counsId;
	private Long userId;
	private List<ChatMessageDto> messageList;

}
