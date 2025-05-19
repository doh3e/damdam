package com.ssafy.damdam.domain.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionReportInputDto {
	private String sReportTitle;
	private String arousal;
	private String valence;
	private String feeling;
	private String summary;
	private String analyze;
}
