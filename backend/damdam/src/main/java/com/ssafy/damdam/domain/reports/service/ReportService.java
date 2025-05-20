package com.ssafy.damdam.domain.reports.service;

import java.util.List;

import com.ssafy.damdam.domain.reports.dto.PeriodReportInputDto;
import com.ssafy.damdam.domain.reports.dto.PeriodReportListDto;
import com.ssafy.damdam.domain.reports.dto.PeriodReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportListDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;

public interface ReportService {
	List<SessionReportListDto> getSReportList(String startDate, String endDate, String keyword);

	List<PeriodReportListDto> getPReportList(String startDate, String endDate, String keyword);

	SessionReportOutputDto getSessionReport(Long reportId);

	void updateSessionReportTitle(Long reportId, String sessionReportTitle);

	void deleteSessionReport(Long reportId);

	PeriodReportOutputDto getPeriodReport(Long pReportId);

	void updatePeriodReportTitle(Long pReportId, String pReportTitle);

	void deletePeriodReport(Long pReportId);

	Long createPeriodReport(PeriodReportInputDto periodReportInputDto);
}
