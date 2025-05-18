package com.ssafy.damdam.domain.counsels.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingChatListDto {

	// 상담 정보를 보여주는 dto
	private Long counsId;
	private String counsTitle;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Boolean isClosed;

	// 프론트에 보여지는 채팅 리스트 (레디스와는 달라서 따로 뺌)
	private List<ChatOutputDto> messageList;
}
