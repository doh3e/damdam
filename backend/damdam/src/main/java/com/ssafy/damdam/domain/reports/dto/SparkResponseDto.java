package com.ssafy.damdam.domain.reports.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SparkResponseDto {
	private int count;
	private List<SparkRawResultDto> results;
}
