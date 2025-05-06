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
public class CounsOutputDto {

	// 상담 상세 정보를 보여주는 dto
	private Long counsId;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
