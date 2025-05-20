package com.ssafy.damdam.domain.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SparkRawResultDto {
	private String counsId;
	private String userId;
	private String timestamp;
	private String message;
	private String emotion;
}
