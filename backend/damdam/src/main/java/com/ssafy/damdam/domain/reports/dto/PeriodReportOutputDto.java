package com.ssafy.damdam.domain.reports.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.ssafy.damdam.domain.counsels.dto.CounselingDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodReportOutputDto {

	private Long pReportId;
	private String pReportTitle;
	private LocalDate startDate;
	private LocalDate endDate;
	private List<CounselingDto> counselings;
	private String advice;
	private String compliment;
	private String summary;
	private String worry;
	private LocalDateTime createdAt;
	private int counselTime;
}
