package com.ssafy.damdam.domain.counsels.dto;

import java.time.LocalDateTime;

import com.ssafy.damdam.domain.counsels.entity.Counseling;
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
	private String counsTitle;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Boolean isClosed;

	public static CounsOutputDto fromEntity(Counseling counseling) {
		return CounsOutputDto.builder()
			.counsId(counseling.getCounsId())
			.counsTitle(counseling.getCounsTitle())
			.createdAt(counseling.getCreatedAt())
			.updatedAt(counseling.getUpdatedAt())
			.isClosed(counseling.getIsClosed())
			.build();
	}
}
