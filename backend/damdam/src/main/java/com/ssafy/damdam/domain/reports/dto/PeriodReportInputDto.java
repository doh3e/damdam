package com.ssafy.damdam.domain.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodReportInputDto {
	private String startDate;
	private String endDate;
}
