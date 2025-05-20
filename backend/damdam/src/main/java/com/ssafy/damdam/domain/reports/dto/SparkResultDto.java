package com.ssafy.damdam.domain.reports.dto;

import java.time.LocalDateTime;

import com.ssafy.damdam.domain.counsels.dto.EmotionDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SparkResultDto {
	private Long counsId;
	private Long userId;
	private LocalDateTime timestamp;
	private String message;
	private EmotionDto emotion;
}
