package com.ssafy.damdam.domain.reports.dto;

import java.time.LocalDate;
import java.util.List;

import com.ssafy.damdam.domain.counsels.dto.UserContextDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LlmPeriodReportRequest {
	private LocalDate startDate;
	private LocalDate endDate;
	private UserContextDto userContext;
	private List<SparkResultDto> messageList;
}
