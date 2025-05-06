package com.ssafy.damdam.domain.counsels.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounsListDto {

	// 상담 목록을 보여주는 dto
	private Long counsId;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

}
